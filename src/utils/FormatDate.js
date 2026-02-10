export const formatDateTime = (value) => {
        if (!value) return "-";

        // If already ISO or Date compatible
        const parsed = new Date(value);

        if (!isNaN(parsed)) {
            return parsed.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        }

        // Handle "MM/DD/YYYY HH:mm:ss" manually
        const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
        if (match) {
            const [, mm, dd, yyyy] = match;
            return `${dd}/${mm}/${yyyy}`;
        }

        return value; // fallback
    };