import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as d3 from 'd3';

interface Transaction {
    id: number;
    from_username: string | null;
    to_username: string;
    amount: number;
    type: 'transfer' | 'topup';
    description: string | null;
    created_at: string;
}

const FinancePage = () => {
    const { user, token } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalVolume: 0,
        totalTopUp: 0,
        totalTransfer: 0
    });
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        type: 'all',
        from_username: '',
        to_username: '',
        minAmount: '',
        maxAmount: ''
    });

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.startDate) queryParams.append('startDate', filters.startDate);
            if (filters.endDate) queryParams.append('endDate', filters.endDate);
            if (filters.type !== 'all') queryParams.append('type', filters.type);
            if (filters.from_username) queryParams.append('from_username', filters.from_username);
            if (filters.to_username) queryParams.append('to_username', filters.to_username);
            if (filters.minAmount) queryParams.append('minAmount', filters.minAmount);
            if (filters.maxAmount) queryParams.append('maxAmount', filters.maxAmount);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success && data.transactions) {
                setTransactions(data.transactions);
                calculateStats(data.transactions);
                renderChart(data.transactions);
            }
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounce filter changes
    useEffect(() => {
        if (!token) return;

        const timer = setTimeout(() => {
            fetchTransactions();
        }, 500);

        return () => clearTimeout(timer);
    }, [filters, token]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const calculateStats = (txs: Transaction[]) => {
        const total = txs.reduce((sum, t) => sum + t.amount, 0);
        const topUp = txs.filter(t => t.type === 'topup').reduce((sum, t) => sum + t.amount, 0);
        const transfer = txs.filter(t => t.type === 'transfer').reduce((sum, t) => sum + t.amount, 0);
        setStats({ totalVolume: total, totalTopUp: topUp, totalTransfer: transfer });
    };

    const renderChart = (txs: Transaction[]) => {
        // Clear previous chart
        d3.select("#chart-container").selectAll("*").remove();

        if (txs.length === 0) {
            d3.select("#chart-container").append("div").attr("class", "text-slate-500 p-4").text("No data to display");
            return;
        }

        // Group by date
        const dataMap = d3.rollup(txs, v => d3.sum(v, d => d.amount), d => d.created_at?.split(' ')[0] || 'Unknown');
        const data = Array.from(dataMap, ([date, volume]) => ({ date: new Date(date), volume }))
            .sort((a, b) => a.date.getTime() - b.date.getTime());

        const margin = { top: 20, right: 30, bottom: 30, left: 60 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select("#chart-container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.date) as [Date, Date])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.volume) as number])
            .nice()
            .range([height, 0]);

        // Grids
        svg.append("g")
            .attr("class", "grid")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5).tickSize(-height).tickFormat(() => ""))
            .selectAll(".tick line")
            .attr("stroke", "#334155")
            .attr("stroke-opacity", 0.2);

        svg.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(() => ""))
            .selectAll(".tick line")
            .attr("stroke", "#334155")
            .attr("stroke-opacity", 0.2);

        // Axes
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5))
            .attr("color", "#94a3b8");

        svg.append("g")
            .call(d3.axisLeft(y).ticks(5))
            .attr("color", "#94a3b8");

        // Area & Line
        const area = d3.area<{ date: Date; volume: number }>()
            .x(d => x(d.date))
            .y0(height)
            .y1(d => y(d.volume))
            .curve(d3.curveMonotoneX);

        svg.append("path")
            .datum(data)
            .attr("fill", "url(#gradient)")
            .attr("d", area);

        const valueline = d3.line<{ date: Date; volume: number }>()
            .x(d => x(d.date))
            .y(d => y(d.volume))
            .curve(d3.curveMonotoneX);

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#10B981")
            .attr("stroke-width", 2)
            .attr("d", valueline);

        // Gradient definition
        const defs = svg.append("defs");
        const gradient = defs.append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");

        gradient.append("stop").attr("offset", "0%").attr("stop-color", "#10B981").attr("stop-opacity", 0.5);
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "#10B981").attr("stop-opacity", 0);

        // Tooltip interaction overlay
        const tooltip = d3.select("body").append("div")
            .attr("class", "absolute z-50 bg-slate-800 text-white text-xs p-2 rounded shadow-lg pointer-events-none opacity-0 transition-opacity");

        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("r", 4)
            .attr("cx", d => x(d.date))
            .attr("cy", d => y(d.volume))
            .attr("fill", "#10B981")
            .attr("stroke", "#020617")
            .attr("stroke-width", 2)
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`Date: ${d.date.toLocaleDateString()}<br/>Vol: Rp ${d.volume.toLocaleString()}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
                d3.select(event.currentTarget).attr("r", 6).attr("fill", "#34d399");
            })
            .on("mouseout", (event) => {
                tooltip.transition().duration(500).style("opacity", 0);
                d3.select(event.currentTarget).attr("r", 4).attr("fill", "#10B981");
            });
    };

    if (!user || user.role !== 'admin') {
        return <div className="p-8 text-center text-red-500">Access Restricted</div>;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Admin Finance Dashboard</h1>

            {/* Filters Section */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm mb-8">
                <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs text-slate-500 mb-1">Date Range</label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                name="startDate"
                                value={filters.startDate}
                                onChange={handleFilterChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                            />
                            <input
                                type="date"
                                name="endDate"
                                value={filters.endDate}
                                onChange={handleFilterChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Type</label>
                        <select
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                        >
                            <option value="all">All Types</option>
                            <option value="transfer">Transfer</option>
                            <option value="topup">Top Up</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs text-slate-500 mb-1">Users</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="from_username"
                                placeholder="Sender Username"
                                value={filters.from_username}
                                onChange={handleFilterChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                            />
                            <input
                                type="text"
                                name="to_username"
                                placeholder="Receiver Username"
                                value={filters.to_username}
                                onChange={handleFilterChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs text-slate-500 mb-1">Amount Range</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                name="minAmount"
                                placeholder="Min"
                                value={filters.minAmount}
                                onChange={handleFilterChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                            />
                            <input
                                type="number"
                                name="maxAmount"
                                placeholder="Max"
                                value={filters.maxAmount}
                                onChange={handleFilterChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Total Transaction Volume</h3>
                    <p className="text-3xl font-bold text-white">Rp {stats.totalVolume.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Total Top Ups</h3>
                    <p className="text-3xl font-bold text-emerald-400">+ Rp {stats.totalTopUp.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Total Transfers</h3>
                    <p className="text-3xl font-bold text-blue-400">↔ Rp {stats.totalTransfer.toLocaleString()}</p>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm mb-8">
                <h3 className="text-xl font-bold mb-6">Transaction Volume Trend</h3>
                <div id="chart-container" className="overflow-x-auto flex justify-center"></div>
            </div>

            {/* Transaction Table */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800 sticky top-0 bg-slate-900/90 backdrop-blur z-10">
                    <h3 className="text-xl font-bold">Recent Transactions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4 font-medium">ID</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">Type</th>
                                <th className="p-4 font-medium">Sender</th>
                                <th className="p-4 font-medium">Receiver</th>
                                <th className="p-4 font-medium text-right">Amount</th>
                                <th className="p-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                            {isLoading ? (
                                <tr><td colSpan={7} className="p-8 text-center">Loading transactions...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-slate-500">No transactions found</td></tr>
                            ) : (
                                transactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4 text-slate-500">#{tx.id}</td>
                                        <td className="p-4 whitespace-nowrap">{new Date(tx.created_at).toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.type === 'topup'
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                {tx.type === 'topup' ? 'Top Up' : 'Transfer'}
                                            </span>
                                        </td>
                                        <td className="p-4">{tx.from_username || '-'}</td>
                                        <td className="p-4">{tx.to_username}</td>
                                        <td className="p-4 text-right font-medium text-white">
                                            Rp {tx.amount.toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <span className="text-emerald-400 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Success
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinancePage;
