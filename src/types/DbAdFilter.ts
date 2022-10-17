interface DbAdFilter {
    status: boolean;
    title?: object;
    category?: string;
    state?: string;
    sort: string;
    offset: number;
    limit: number;
}

export default DbAdFilter;