import { FileUp, Activity, FileCheck, BarChart3 } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps): React.ReactElement {
  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 transition-[border-color,transform] duration-200 ease-out hover:border-blue-200 motion-safe:hover:-translate-y-1 motion-reduce:transition-none sm:p-6 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900/50">
      <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-700 transition-colors duration-200 group-hover:border-blue-200 group-hover:bg-blue-100 motion-reduce:transition-none sm:mb-6 sm:h-12 sm:w-12 dark:border-blue-900/30 dark:bg-blue-950/40 dark:text-blue-300 dark:group-hover:bg-blue-950">
        {icon}
      </div>
      <div className="space-y-3">
        <h3 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl dark:text-white">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {description}
        </p>
      </div>
    </div>
  );
}

const FEATURES: FeatureCardProps[] = [
  {
    icon: <FileUp className="h-6 w-6" />,
    title: "ยื่นเอกสารออนไลน์",
    description:
      "ส่งและจัดการเอกสารโครงการผ่านระบบออนไลน์ได้ทันที ช่วยลดขั้นตอนการใช้กระดาษ",
  },
  {
    icon: <Activity className="h-6 w-6" />,
    title: "ติดตามสถานะ",
    description: "ตรวจสอบความคืบหน้าของโครงการและขั้นตอนการอนุมัติได้ชัดเจน",
  },
  {
    icon: <FileCheck className="h-6 w-6" />,
    title: "สร้างเอกสารอัตโนมัติ",
    description: "สร้างเอกสารมาตรฐานโครงการตามแบบฟอร์ม RHHSDI",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "สรุปภาพรวม",
    description:
      "ดูแดชบอร์ดและรายงานภาพรวมโครงการทั้งหมด เพื่อช่วยติดตามงานได้เป็นระบบ",
  },
];

export default function FeatureGrid(): React.ReactElement {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-5 md:px-6 md:py-16">
      <div className="flex flex-col space-y-8 md:space-y-12">
        <div className="flex max-w-3xl flex-col space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl dark:text-white">
            ฟีเจอร์หลักของระบบ
          </h2>
          <p className="text-sm leading-7 text-slate-700 sm:text-base dark:text-slate-300">
            เครื่องมือสำหรับสร้างเอกสาร จัดเก็บไฟล์ ติดตามสถานะ
            และดูภาพรวมโครงการของ RHHSDI
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
