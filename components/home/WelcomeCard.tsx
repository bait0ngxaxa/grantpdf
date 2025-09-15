import { Users } from "lucide-react";
import { Session } from "next-auth";

interface WelcomeCardProps {
  session: Session | null;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({ session }) => {
  return (
    <div className="card bg-white shadow-xl rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02] border border-primary/20">
      <div className="card-body p-6 relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-secondary/5 rounded-full translate-y-8 -translate-x-8"></div>

        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <div className="bg-primary p-3 rounded-xl shadow-lg mr-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold bg-primary bg-clip-text text-transparent">
              {session
                ? `สวัสดีครับ คุณ${
                    session.user?.name?.split(" ")[0] ||
                    session.user?.email?.split("@")[0]
                  }`
                : "ยินดีต้อนรับ!"}
            </h2>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            {session
              ? "พร้อมให้คุณสร้างเอกสารและแบบฟอร์มได้อย่างรวดเร็ว "
              : ""}
          </p>

          {session && (
            <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-3 backdrop-blur-sm">
              <div className="flex items-center text-xs text-primary font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                ออนไลน์ • พร้อมใช้งาน
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
