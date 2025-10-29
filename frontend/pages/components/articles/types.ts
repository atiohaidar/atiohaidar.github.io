import type { DASHBOARD_THEME } from '../../../utils/styles';

export type DashboardThemeMap = typeof DASHBOARD_THEME;
export type DashboardThemeKey = keyof DashboardThemeMap;
export type DashboardPalette = DashboardThemeMap[DashboardThemeKey];

export interface ArticleFormState {
    slug: string;
    title: string;
    content: string;
    published: boolean;
}

export const DEFAULT_ARTICLE_FORM_STATE: ArticleFormState = {
    slug: '',
    title: '',
    content: '',
    published: false,
};
