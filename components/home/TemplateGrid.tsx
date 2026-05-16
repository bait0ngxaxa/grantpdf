import {
  FileUp,
  Activity,
  FileCheck,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  colorScheme: "blue" | "green" | "purple" | "orange";
}

const COLOR_MAP = {
  blue: "text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10",
  green:
    "text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10",
  purple:
    "text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-900/10",
  orange:
    "text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/10",
};

function FeatureCard({
  icon,
  title,
  description,
  colorScheme,
}: FeatureCardProps): React.ReactElement {
  const colorClasses = COLOR_MAP[colorScheme];

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-200/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900/30 dark:hover:shadow-none">
      <div className="relative z-10">
        <div
          className={cn(
            "mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
            colorClasses,
          )}
        >
          {icon}
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
          System Capability
        </span>
        <div className="flex h-8 w-8 translate-x-4 items-center justify-center rounded-full bg-blue-50 text-blue-600 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 dark:bg-blue-900/30 dark:text-blue-400">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>

      <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-blue-50/50 blur-2xl transition-opacity group-hover:opacity-100 dark:bg-blue-900/10" />
    </div>
  );
}

const FEATURES: FeatureCardProps[] = [
  {
    icon: <FileUp className="h-6 w-6" />,
    title: "ยื่นเอกสารออนไลน์",
    description:
      "ส่งและจัดการเอกสารโครงการผ่านระบบ Cloud ได้ทันที สะดวกและลดขั้นตอนการใช้กระดาษ",
    colorScheme: "blue",
  },
  {
    icon: <Activity className="h-6 w-6" />,
    title: "ติดตามสถานะ",
    description: "ตรวจสอบความคืบหน้าของโครงการและขั้นตอนการอนุมัติได้",
    colorScheme: "green",
  },
  {
    icon: <FileCheck className="h-6 w-6" />,
    title: "สร้างเอกสารอัตโนมัติ",
    description: "ผลิตเอกสารมาตรฐานโครงการตามแบบฟอร์ม RHHSDI ",
    colorScheme: "purple",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "สรุปภาพรวม",
    description:
      "แดชบอร์ดสรุปผลและรายงานภาพรวมโครงการทั้งหมด เพื่อการบริหารจัดการที่ชัดเจน",
    colorScheme: "orange",
  },
];

export default function FeatureGrid(): React.ReactElement {
  return (
    <section className="w-full py-12">
      <div className="flex flex-col space-y-12">
        <div className="flex flex-col space-y-4 border-l-4 border-blue-500 pl-6">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase sm:text-4xl dark:text-white">
            ฟีเจอร์หลักของระบบ
          </h2>
          <p className="max-w-2xl text-slate-500 dark:text-slate-400">
            แพลตฟอร์มดิจิทัลที่ช่วยยกระดับการบริหารจัดการโครงการของ RHHSDI
            ให้มีประสิทธิภาพสูงสุด
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
