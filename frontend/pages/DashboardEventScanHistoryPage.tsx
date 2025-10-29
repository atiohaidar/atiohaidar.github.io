import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import * as d3 from 'd3';
import { getEvent, getEventScanHistory } from '../lib/api/services';
import { COLORS } from '../utils/styles';
import type { EventScanHistory } from '../apiTypes';

type TimeGranularity = 'minute' | 'hour' | 'day';

const DashboardEventScanHistoryPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const chartRef = useRef<SVGSVGElement>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedScanner, setSelectedScanner] = useState<string>('all');
    const [timeGranularity, setTimeGranularity] = useState<TimeGranularity>('hour');
    const [customTimeRange, setCustomTimeRange] = useState<{ start: string; end: string } | null>(null);

    // Fetch event
    const { data: event } = useQuery({
        queryKey: ['event', eventId],
        queryFn: () => getEvent(eventId!),
        enabled: !!eventId,
    });

    // Fetch scan history
    const { data: scanHistory, isLoading } = useQuery({
        queryKey: ['event-scan-history', eventId],
        queryFn: () => getEventScanHistory(eventId!),
        enabled: !!eventId,
    });

    // Get unique scanners for filter
    const uniqueScanners = useMemo(() => {
        if (!scanHistory) return [];
        return Array.from(new Set(scanHistory.map(s => s.scanned_by)));
    }, [scanHistory]);

    // Filter scan history
    const filteredScans = useMemo(() => {
        if (!scanHistory) return [];
        
        return scanHistory.filter(scan => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (!scan.attendee_username.toLowerCase().includes(query) &&
                    !scan.scanned_by.toLowerCase().includes(query)) {
                    return false;
                }
            }

            // Scanner filter
            if (selectedScanner !== 'all' && scan.scanned_by !== selectedScanner) {
                return false;
            }

            // Time range filter
            if (customTimeRange) {
                const scanTime = new Date(scan.scanned_at);
                const start = new Date(customTimeRange.start);
                const end = new Date(customTimeRange.end);
                if (scanTime < start || scanTime > end) {
                    return false;
                }
            }

            return true;
        });
    }, [scanHistory, searchQuery, selectedScanner, customTimeRange]);

    // Get time range for chart (default: fit from earliest to latest)
    const timeRange = useMemo(() => {
        if (customTimeRange) {
            return {
                start: new Date(customTimeRange.start),
                end: new Date(customTimeRange.end),
            };
        }

        if (!filteredScans || filteredScans.length === 0) {
            const now = new Date();
            return {
                start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
                end: now,
            };
        }

        const times = filteredScans.map(s => new Date(s.scanned_at));
        return {
            start: new Date(Math.min(...times.map(t => t.getTime()))),
            end: new Date(Math.max(...times.map(t => t.getTime()))),
        };
    }, [filteredScans, customTimeRange]);

    // Aggregate data by time granularity
    const chartData = useMemo(() => {
        if (!filteredScans || filteredScans.length === 0) return [];

        const grouped = new Map<string, number>();

        filteredScans.forEach(scan => {
            const date = new Date(scan.scanned_at);
            let key: string;

            switch (timeGranularity) {
                case 'minute':
                    key = d3.timeFormat('%Y-%m-%d %H:%M')(date);
                    break;
                case 'hour':
                    key = d3.timeFormat('%Y-%m-%d %H:00')(date);
                    break;
                case 'day':
                    key = d3.timeFormat('%Y-%m-%d')(date);
                    break;
            }

            grouped.set(key, (grouped.get(key) || 0) + 1);
        });

        return Array.from(grouped.entries())
            .map(([key, count]) => ({
                time: new Date(key),
                count,
            }))
            .sort((a, b) => a.time.getTime() - b.time.getTime());
    }, [filteredScans, timeGranularity]);

    // Draw chart
    useEffect(() => {
        if (!chartRef.current || chartData.length === 0) return;

        const svg = d3.select(chartRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 20, right: 30, bottom: 60, left: 60 };
        const width = chartRef.current.clientWidth - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const g = svg
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Scales
        const x = d3.scaleTime()
            .domain([timeRange.start, timeRange.end])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => d.count) || 10])
            .nice()
            .range([height, 0]);

        // Axes
        const xAxis = d3.axisBottom(x).ticks(8);
        const yAxis = d3.axisLeft(y).ticks(6);

        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis)
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');

        g.append('g').call(yAxis);

        // Grid lines
        g.append('g')
            .attr('class', 'grid')
            .attr('opacity', 0.1)
            .call(d3.axisLeft(y).ticks(6).tickSize(-width).tickFormat(() => ''));

        // Line
        const line = d3.line<{ time: Date; count: number }>()
            .x(d => x(d.time))
            .y(d => y(d.count))
            .curve(d3.curveMonotoneX);

        g.append('path')
            .datum(chartData)
            .attr('fill', 'none')
            .attr('stroke', '#3b82f6')
            .attr('stroke-width', 2)
            .attr('d', line);

        // Points
        g.selectAll('.dot')
            .data(chartData)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(d.time))
            .attr('cy', d => y(d.count))
            .attr('r', 4)
            .attr('fill', '#3b82f6')
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .on('mouseenter', function(event, d) {
                d3.select(this).attr('r', 6);
                
                const tooltip = g.append('g')
                    .attr('class', 'tooltip')
                    .attr('transform', `translate(${x(d.time)},${y(d.count) - 20})`);

                tooltip.append('rect')
                    .attr('x', -40)
                    .attr('y', -25)
                    .attr('width', 80)
                    .attr('height', 20)
                    .attr('fill', 'black')
                    .attr('opacity', 0.8)
                    .attr('rx', 4);

                tooltip.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('fill', 'white')
                    .attr('font-size', '12px')
                    .text(`${d.count} scan${d.count > 1 ? 's' : ''}`);
            })
            .on('mouseleave', function() {
                d3.select(this).attr('r', 4);
                g.selectAll('.tooltip').remove();
            });

        // Labels
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('fill', 'currentColor')
            .text('Jumlah Scan');

        g.append('text')
            .attr('transform', `translate(${width / 2},${height + margin.bottom - 5})`)
            .style('text-anchor', 'middle')
            .style('fill', 'currentColor')
            .text('Waktu');

    }, [chartData, timeRange, timeGranularity]);

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleResetTimeRange = () => {
        setCustomTimeRange(null);
    };

    return (
        <div className={`min-h-screen ${COLORS.BG_PRIMARY} p-6`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(`/dashboard/events/${eventId}`)}
                        className={`${COLORS.TEXT_SECONDARY} hover:${COLORS.TEXT_PRIMARY} mb-4 flex items-center`}
                    >
                        ← Kembali ke Detail Acara
                    </button>
                    <h1 className={`text-3xl font-bold ${COLORS.TEXT_PRIMARY} mb-2`}>
                        Riwayat Scan QR
                    </h1>
                    {event && (
                        <p className={COLORS.TEXT_SECONDARY}>Acara: {event.title}</p>
                    )}
                </div>

                {/* Filters */}
                <div className={`${COLORS.BG_SECONDARY} p-6 rounded-lg border ${COLORS.BORDER} mb-6`}>
                    <h2 className={`text-xl font-bold ${COLORS.TEXT_PRIMARY} mb-4`}>Filter</h2>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Search */}
                        <div>
                            <label className={`block text-sm font-medium ${COLORS.TEXT_SECONDARY} mb-2`}>
                                Cari
                            </label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Username atau scanner..."
                                className={`w-full px-4 py-2 rounded-lg border ${COLORS.BORDER} ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY}`}
                            />
                        </div>

                        {/* Scanner filter */}
                        <div>
                            <label className={`block text-sm font-medium ${COLORS.TEXT_SECONDARY} mb-2`}>
                                Scanner
                            </label>
                            <select
                                value={selectedScanner}
                                onChange={(e) => setSelectedScanner(e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg border ${COLORS.BORDER} ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY}`}
                            >
                                <option value="all">Semua Scanner</option>
                                {uniqueScanners.map(scanner => (
                                    <option key={scanner} value={scanner}>{scanner}</option>
                                ))}
                            </select>
                        </div>

                        {/* Time granularity */}
                        <div>
                            <label className={`block text-sm font-medium ${COLORS.TEXT_SECONDARY} mb-2`}>
                                Granularitas
                            </label>
                            <select
                                value={timeGranularity}
                                onChange={(e) => setTimeGranularity(e.target.value as TimeGranularity)}
                                className={`w-full px-4 py-2 rounded-lg border ${COLORS.BORDER} ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY}`}
                            >
                                <option value="minute">Per Menit</option>
                                <option value="hour">Per Jam</option>
                                <option value="day">Per Hari</option>
                            </select>
                        </div>

                        {/* Reset button */}
                        <div className="flex items-end">
                            <button
                                onClick={handleResetTimeRange}
                                className={`w-full px-4 py-2 ${COLORS.BG_ACCENT} ${COLORS.TEXT_ACCENT_CONTRAST} rounded-lg hover:opacity-90`}
                            >
                                Reset Filter
                            </button>
                        </div>
                    </div>

                    {/* Custom time range */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium ${COLORS.TEXT_SECONDARY} mb-2`}>
                                Dari
                            </label>
                            <input
                                type="datetime-local"
                                value={customTimeRange?.start || ''}
                                onChange={(e) => setCustomTimeRange(prev => ({
                                    start: e.target.value,
                                    end: prev?.end || new Date().toISOString().slice(0, 16),
                                }))}
                                className={`w-full px-4 py-2 rounded-lg border ${COLORS.BORDER} ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY}`}
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium ${COLORS.TEXT_SECONDARY} mb-2`}>
                                Sampai
                            </label>
                            <input
                                type="datetime-local"
                                value={customTimeRange?.end || ''}
                                onChange={(e) => setCustomTimeRange(prev => ({
                                    start: prev?.start || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                                    end: e.target.value,
                                }))}
                                className={`w-full px-4 py-2 rounded-lg border ${COLORS.BORDER} ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className={`${COLORS.BG_SECONDARY} p-6 rounded-lg border ${COLORS.BORDER} mb-6`}>
                    <h2 className={`text-xl font-bold ${COLORS.TEXT_PRIMARY} mb-4`}>
                        Grafik Time Series
                    </h2>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-96">
                            <p className={COLORS.TEXT_SECONDARY}>Memuat data...</p>
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className="flex items-center justify-center h-96">
                            <p className={COLORS.TEXT_SECONDARY}>Belum ada data scan</p>
                        </div>
                    ) : (
                        <svg
                            ref={chartRef}
                            className="w-full"
                            style={{ height: '400px' }}
                        />
                    )}
                </div>

                {/* Scan history table */}
                <div className={`${COLORS.BG_SECONDARY} p-6 rounded-lg border ${COLORS.BORDER}`}>
                    <h2 className={`text-xl font-bold ${COLORS.TEXT_PRIMARY} mb-4`}>
                        Detail Riwayat ({filteredScans?.length || 0})
                    </h2>

                    {isLoading ? (
                        <div className="text-center py-8">
                            <p className={COLORS.TEXT_SECONDARY}>Memuat riwayat...</p>
                        </div>
                    ) : !filteredScans || filteredScans.length === 0 ? (
                        <div className="text-center py-8">
                            <p className={COLORS.TEXT_SECONDARY}>Belum ada riwayat scan</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className={`border-b ${COLORS.BORDER}`}>
                                        <th className={`text-left py-3 px-4 ${COLORS.TEXT_SECONDARY} font-medium`}>Peserta</th>
                                        <th className={`text-left py-3 px-4 ${COLORS.TEXT_SECONDARY} font-medium`}>Waktu Scan</th>
                                        <th className={`text-left py-3 px-4 ${COLORS.TEXT_SECONDARY} font-medium`}>Di-scan Oleh</th>
                                        <th className={`text-left py-3 px-4 ${COLORS.TEXT_SECONDARY} font-medium`}>Lokasi</th>
                                        <th className={`text-left py-3 px-4 ${COLORS.TEXT_SECONDARY} font-medium`}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredScans.map((scan, index) => (
                                        <tr key={scan.id} className={`border-b ${COLORS.BORDER} hover:${COLORS.BG_HOVER}`}>
                                            <td className={`py-3 px-4 ${COLORS.TEXT_PRIMARY}`}>
                                                {scan.attendee_username}
                                            </td>
                                            <td className={`py-3 px-4 ${COLORS.TEXT_SECONDARY} text-sm`}>
                                                {formatDateTime(scan.scanned_at)}
                                            </td>
                                            <td className={`py-3 px-4 ${COLORS.TEXT_SECONDARY} text-sm`}>
                                                {scan.scanned_by}
                                            </td>
                                            <td className={`py-3 px-4 ${COLORS.TEXT_SECONDARY} text-sm`}>
                                                {scan.latitude && scan.longitude ? (
                                                    <a
                                                        href={`https://www.google.com/maps?q=${scan.latitude},${scan.longitude}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:text-blue-600 flex items-center"
                                                    >
                                                        📍 Lihat di Maps
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className={`py-3 px-4`}>
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    scan.attendee_status === 'present' 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                }`}>
                                                    {scan.attendee_status === 'present' ? 'Hadir' : 'Terdaftar'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardEventScanHistoryPage;
