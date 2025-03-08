"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Link } from "lucide-react";
import { toast } from "sonner";

export default function ShareSessionButton({ sessionId }: { sessionId: string }) {
  const [shareableLink, setShareableLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateShareableLink = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/badminton-sessions/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();
      if (!res.ok) toast.error(data.error || "Failed to generate link");

      setShareableLink(data.shareableLink);
      toast.success("Shareable link generated!");
      copyToClipboard();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (shareableLink) {
      navigator.clipboard.writeText(shareableLink);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={generateShareableLink} disabled={loading}>
        {loading ? "Generating Link" : "Share Session"}
      </Button>
      {shareableLink && (
        <Button variant="outline" onClick={copyToClipboard}>
          <Copy className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
