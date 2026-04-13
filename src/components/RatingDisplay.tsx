import { Star, StarHalf } from "lucide-react";
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
  // Internal rating is always 1-10
  const internalRating = rating ?? 0;
  const iconSize = size === "sm" ? 14 : 18;

  if (isStars) {
    // Convert internal 1-10 to star value: e.g. 7 → 3.5 stars
    const starValue = internalRating / 2;

    return (
      <div className="flex gap-0.5">
        {Array.from({ length: max }, (_, i) => {
          const starIndex = i + 1;
          const isFull = starValue >= starIndex;
          const isHalf = !isFull && starValue >= starIndex - 0.5;

          return (
            <div key={i} className="relative" style={{ width: iconSize, height: iconSize }}>
              {/* Background empty star */}
              <Star size={iconSize} className="text-muted-foreground/30 absolute inset-0" />
              {/* Filled or half star */}
              {isFull && <Star size={iconSize} className="fill-rating text-rating absolute inset-0" />}
              {isHalf && (
                <div className="absolute inset-0 overflow-hidden" style={{ width: iconSize / 2 }}>
                  <Star size={iconSize} className="fill-rating text-rating" />
                </div>
              )}
              {/* Click zones: left half = half star, right half = full star */}
              {onChange && (
                <>
                  <button
                    type="button"
                    className="absolute left-0 top-0 h-full w-1/2 z-10"
                    onClick={() => onChange((starIndex - 1) * 2 + 1)}
                    aria-label={`${starIndex - 0.5} Sterne`}
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-full w-1/2 z-10"
                    onClick={() => onChange(starIndex * 2)}
                    aria-label={`${starIndex} Sterne`}
                  />
                </>
              )}
            </div>
          );
        })}
        {!onChange && internalRating > 0 && (
          <span className="text-xs text-muted-foreground ml-1">{starValue % 1 === 0 ? starValue : starValue.toFixed(1)}</span>
        )}
      </div>
    );
  }

  // Points mode (1-10) — maps directly to internal value
  const displayRating = internalRating;

  return (
    <div className="flex items-center gap-1">
      {onChange ? (
        <div className="flex gap-0.5">
          {Array.from({ length: max }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i + 1)}
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
