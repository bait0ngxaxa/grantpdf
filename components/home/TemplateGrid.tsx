import { LayoutTemplate } from "lucide-react";

interface TemplateCardProps {
    emoji: string;
    title: string;
    subtitle: string;
    colorScheme: "blue" | "green" | "purple" | "orange";
}

const COLOR_SCHEMES = {
    blue: {
        bgHover: "hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20",
        iconBg: "bg-blue-50 dark:bg-blue-500/10",
        iconHover: "group-hover:bg-blue-600 dark:group-hover:bg-blue-500",
        accent: "bg-blue-50/50 dark:bg-blue-500/5",
        text: "text-blue-600 dark:text-blue-400",
    },
    green: {
        bgHover: "hover:shadow-green-100/50 dark:hover:shadow-green-900/20",
        iconBg: "bg-green-50 dark:bg-green-500/10",
        iconHover: "group-hover:bg-green-600 dark:group-hover:bg-green-500",
        accent: "bg-green-50/50 dark:bg-green-500/5",
        text: "text-green-600 dark:text-green-400",
    },
    purple: {
        bgHover: "hover:shadow-purple-100/50 dark:hover:shadow-purple-900/20",
        iconBg: "bg-purple-50 dark:bg-purple-500/10",
        iconHover: "group-hover:bg-purple-600 dark:group-hover:bg-purple-500",
        accent: "bg-purple-50/50 dark:bg-purple-500/5",
        text: "text-purple-600 dark:text-purple-400",
    },
    orange: {
        bgHover: "hover:shadow-orange-100/50 dark:hover:shadow-orange-900/20",
        iconBg: "bg-orange-50 dark:bg-orange-500/10",
        iconHover: "group-hover:bg-orange-500 dark:group-hover:bg-orange-400",
        accent: "bg-orange-50/50 dark:bg-orange-500/5",
        text: "text-orange-600 dark:text-orange-400",
    },
} as const;

function TemplateCard({
    emoji,
    title,
    subtitle,
    colorScheme,
}: TemplateCardProps): React.ReactElement {
    const colors = COLOR_SCHEMES[colorScheme];

    return (
        <div
            className={`group relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-xl ${colors.bgHover} hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden`}
        >
            <div
                className={`absolute top-0 right-0 w-24 h-24 ${colors.accent} rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}
            />
            <div className="relative">
                <div
                    className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center text-2xl mb-4 ${colors.iconHover} group-hover:text-white transition-colors duration-300`}
                >
                    {emoji}
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">
                    {title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    {subtitle}
                </p>
                <div
                    className={`flex items-center ${colors.text} text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300`}
                >
                    สร้างเลย <span className="ml-1">→</span>
                </div>
            </div>
        </div>
    );
}

const TEMPLATES: TemplateCardProps[] = [
    {
        emoji: "📋",
        title: "ใบอนุมัติ",
        subtitle: "Approval Form",
        colorScheme: "blue",
    },
    { emoji: "📄", title: "สัญญา", subtitle: "Contract", colorScheme: "green" },
    {
        emoji: "📊",
        title: "โครงการ",
        subtitle: "Project",
        colorScheme: "purple",
    },
    {
        emoji: "📝",
        title: "TOR",
        subtitle: "Terms of Reference",
        colorScheme: "orange",
    },
];

export default function TemplateGrid(): React.ReactElement {
    return (
        <div className="w-full">
            <div className="w-full space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <LayoutTemplate className="h-5 w-5 text-blue-500" />
                        เทมเพลตเอกสาร
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {TEMPLATES.map((template) => (
                        <TemplateCard key={template.title} {...template} />
                    ))}
                </div>
            </div>
        </div>
    );
}
