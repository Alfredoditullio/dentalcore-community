export function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'hace unos segundos';
    const min = Math.floor(sec / 60);
    if (min < 60) return `hace ${min} min`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `hace ${hr} h`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `hace ${day} d`;
    if (day < 30) return `hace ${Math.floor(day / 7)} sem`;
    if (day < 365) return `hace ${Math.floor(day / 30)} m`;
    return `hace ${Math.floor(day / 365)} años`;
}

export function initials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() || '')
        .join('');
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);
}
