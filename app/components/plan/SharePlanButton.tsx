"use client";

import { useState, useEffect } from "react";

import { logger } from "@/lib/logger";

import Icon from "../ui/Icon";

interface SharePlanButtonProps {
  className?: string;
}

export default function SharePlanButton({ className }: SharePlanButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [spouseConnected, setSpouseConnected] = useState(false);
  const [spouseUserId, setSpouseUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    // Check if user has a connected spouse
    async function checkSpouseConnection() {
      const response = await fetch("/api/collaboration/route");
      if (response.ok) {
        const data = await response.json();
        if (data.connection && data.connection.status === "connected") {
          setSpouseConnected(true);
          // Determine spouse user ID
          const spouseId =
            data.connection.user_id_1 === data.currentUserId
              ? data.connection.user_id_2
              : data.connection.user_id_1;
          setSpouseUserId(spouseId);
        }
      }
    }
    checkSpouseConnection();
  }, []);

  const handleShare = async () => {
    if (!spouseUserId) return;

    setSharing(true);
    try {
      const response = await fetch("/api/plan/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spouse_user_id: spouseUserId,
          message: message.trim() || undefined,
          can_regenerate: false,
        }),
      });

      if (response.ok) {
        setShared(true);
        setTimeout(() => {
          setShowModal(false);
          setShared(false);
          setMessage("");
        }, 2000);
      }
    } catch (error) {
      logger.error("Failed to share plan:", error);
      alert("Failed to share plan. Please try again.");
    } finally {
      setSharing(false);
    }
  };

  if (!spouseConnected) {
    return null; // Don't show if no spouse connected
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={
          className ||
          "inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
        }
      >
        <Icon name="Share2" className="h-4 w-4" />
        Share with Spouse
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            {shared ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Icon name="CheckCircle" className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-slate-900">Plan Shared!</h3>
                <p className="text-slate-600">Your spouse can now view your plan</p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Share Your Plan</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <Icon name="X" className="h-6 w-6" />
                  </button>
                </div>

                <p className="mb-4 text-slate-600">
                  Share your personalized financial plan with your spouse for collaborative
                  planning.
                </p>

                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Add a message (optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hey, check out my updated financial plan..."
                    className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleShare}
                    disabled={sharing}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 font-semibold text-white transition-all hover:from-slate-800 hover:to-slate-900 disabled:opacity-50"
                  >
                    {sharing ? (
                      <>
                        <Icon name="Loader" className="h-5 w-5 animate-spin" />
                        Sharing...
                      </>
                    ) : (
                      <>
                        <Icon name="Share2" className="h-5 w-5" />
                        Share Plan
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
