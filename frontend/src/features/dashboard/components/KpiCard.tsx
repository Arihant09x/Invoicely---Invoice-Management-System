import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: number;
  icon: LucideIcon;
  format?: (n: number) => string;
  accent?: "indigo" | "emerald" | "amber" | "rose";
  hint?: string;
  index?: number;
}

const accents = {
  indigo: "bg-indigo-500/10 text-indigo-600",
  emerald: "bg-emerald-500/10 text-emerald-600",
  amber: "bg-amber-500/10 text-amber-600",
  rose: "bg-rose-500/10 text-rose-600",
};

function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    const total = Math.round(duration / 16);
    const tick = () => {
      frame++;
      const progress = 1 - Math.pow(1 - frame / total, 3); // easeOutCubic
      setValue(target * progress);
      if (frame < total) requestAnimationFrame(tick);
      else setValue(target);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  format,
  accent = "indigo",
  hint,
  index = 0,
}: Props) {
  const animated = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md ">
        <CardContent className="flex items-start justify-between p-5">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold tabular-nums">
              {format
                ? format(animated)
                : Math.round(animated).toLocaleString()}
            </p>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          </div>
          <div className={cn("rounded-xl p-2.5", accents[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
