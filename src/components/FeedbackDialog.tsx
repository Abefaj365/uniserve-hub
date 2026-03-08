import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  complaintId: string;
  complaintTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingFeedback?: { rating: number | null; comment: string | null } | null;
}

export default function FeedbackDialog({ complaintId, complaintTitle, open, onOpenChange, existingFeedback }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(existingFeedback?.rating ?? 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingFeedback?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    setSubmitting(true);
    const { error } = await supabase.from("feedback").insert({
      complaint_id: complaintId,
      user_id: user.id,
      rating,
      comment: comment.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Thank you!", description: "Your feedback has been submitted." });
    queryClient.invalidateQueries({ queryKey: ["my-feedback"] });
    onOpenChange(false);
  };

  const isReadOnly = !!existingFeedback;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isReadOnly ? "Your Feedback" : "Rate this Resolution"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isReadOnly ? "Feedback for" : "How satisfied are you with the resolution of"}{" "}
            <span className="font-medium text-foreground">"{complaintTitle}"</span>?
          </p>
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={isReadOnly}
                  className="p-1 transition-transform hover:scale-110 disabled:cursor-default"
                  onMouseEnter={() => !isReadOnly && setHoveredRating(star)}
                  onMouseLeave={() => !isReadOnly && setHoveredRating(0)}
                  onClick={() => !isReadOnly && setRating(star)}
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>{isReadOnly ? "Your Comment" : "Comment (optional)"}</Label>
            <Textarea
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              disabled={isReadOnly}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isReadOnly ? "Close" : "Cancel"}
          </Button>
          {!isReadOnly && (
            <Button onClick={handleSubmit} disabled={submitting || rating === 0}>
              {submitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
