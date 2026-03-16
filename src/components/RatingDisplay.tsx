import { Star } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

interface RatingDisplayProps {
  rating: number | null;
  onChange?: (rating: number) => void;
  size?: "sm" | "md";
}

export function RatingDisplay({ rating, onChange, size = "md" }: RatingDisplayProps) {
  const { settings } = useSettings();
  const isStars = settings.rating_system === "stars";
  const max = isStars ? 5 : 10;
  const displayRating = rating ? (isStars ? Math.min(Math.ceil(rating / 2), 5) : rating) : 0;
  const iconSize = size === "sm" ? 14 : 18;

  if (isStars) {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: max }, (_, i) => (
          <button
            key={i}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(((i + 1) * 2))}
            className="disabled:cursor-default"
          >
            <Star
              size={iconSize}
              className={i < displayRating ? "fill-rating text-rating" : "text-muted-foreground/30"}
            />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {onChange ? (
        <div className="flex gap-0.5">
          {Array.from({ length: max }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange?.(i + 1)}
              className={`h-5 w-5 rounded-sm text-xs font-medium flex items-center justify-center transition-colors ${
                i < displayRating ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      ) : (
        <span className="text-sm font-medium text-primary">{displayRating}/{max}</span>
      )}
    </div>
  );
}
