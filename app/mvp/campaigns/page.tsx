"use client";

import React, { useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  CAMPAIGN_BOARD_COLUMNS,
  CampaignBoardColumn,
  INITIAL_CAMPAIGN_BOARD_CARDS,
  cardsForCampaignBoardColumn,
  moveCampaignBoardCard,
} from "../../../src/lib/campaign-board";

const COLUMN_CONFIG: Record<CampaignBoardColumn, { color: string; dot: string }> = {
  "Uploaded":        { color: "bg-slate-100 text-slate-600",   dot: "bg-slate-400" },
  "Ready":           { color: "bg-blue-50 text-blue-700",       dot: "bg-blue-400" },
  "Draft Generated": { color: "bg-violet-50 text-violet-700",   dot: "bg-violet-400" },
  "Needs Review":    { color: "bg-amber-50 text-amber-700",     dot: "bg-amber-400" },
  "Approved":        { color: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-400" },
  "Exported":        { color: "bg-teal-50 text-teal-700",       dot: "bg-teal-400" },
  "Replied":         { color: "bg-indigo-50 text-indigo-700",   dot: "bg-indigo-400" },
  "Not Interested":  { color: "bg-orange-50 text-orange-700",   dot: "bg-orange-400" },
  "Do Not Contact":  { color: "bg-red-50 text-red-700",         dot: "bg-red-400" },
};

const OWNER_COLORS: Record<string, string> = {
  JR: "bg-indigo-100 text-indigo-700",
  DK: "bg-purple-100 text-purple-700",
};

export default function CampaignBoardPage() {
  const [cards, setCards] = useState(INITIAL_CAMPAIGN_BOARD_CARDS);
  const [dragging, setDragging] = useState<number | null>(null);
  const draggingRef = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<CampaignBoardColumn | null>(null);

  const moveCard = (id: number, col: CampaignBoardColumn) => {
    setCards((prev) => moveCampaignBoardCard(prev, id, col));
  };
  const onDragStart = (e: React.DragEvent, id: number) => {
    draggingRef.current = id;
    setDragging(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(id));
  };
  const onDragOver = (e: React.DragEvent, col: CampaignBoardColumn) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(col);
  };
  const onDrop = (e: React.DragEvent, col: CampaignBoardColumn) => {
    e.preventDefault();
    const transferredId = Number(e.dataTransfer.getData("text/plain"));
    const cardId = Number.isFinite(transferredId) && transferredId > 0 ? transferredId : draggingRef.current;
    if (cardId !== null) {
      moveCard(cardId, col);
    }
    draggingRef.current = null;
    setDragging(null);
    setDragOver(null);
  };
  const onDragEnd = () => {
    draggingRef.current = null;
    setDragging(null);
    setDragOver(null);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Account Growth Board</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track and manage accounts through the upsell pipeline — from upload to approved outreach.
        </p>
      </div>

      {/* Board */}
      <div className="flex gap-3 overflow-x-auto pb-4 flex-1">
        {CAMPAIGN_BOARD_COLUMNS.map((col) => {
          const colCards = cardsForCampaignBoardColumn(cards, col);
          const cfg = COLUMN_CONFIG[col];
          const isOver = dragOver === col;

          return (
            <div
              key={col}
              className="flex flex-col flex-shrink-0 w-56"
              data-testid={`campaign-column-${col}`}
              onDragOver={(e) => onDragOver(e, col)}
              onDrop={(e) => onDrop(e, col)}
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between rounded-xl px-3 py-2 mb-2 ${cfg.color}`}>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                  <span className="text-xs font-semibold">{col}</span>
                </div>
                <span className="text-xs font-bold opacity-60">{colCards.length}</span>
              </div>

              {/* Drop Zone */}
              <div
                className={`flex flex-col gap-2 flex-1 min-h-24 rounded-xl p-1 transition-colors
                  ${isOver ? "bg-indigo-50 ring-2 ring-indigo-300 ring-dashed" : "bg-transparent"}`}
              >
                {colCards.map((card) => (
                  <div
                    key={card.id}
                    draggable
                    data-testid={`campaign-card-${card.name}`}
                    onDragStart={(e) => onDragStart(e, card.id)}
                    onDragEnd={onDragEnd}
                    className={`bg-white rounded-xl border border-slate-100 p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-indigo-200 transition-all
                      ${dragging === card.id ? "opacity-40 scale-95" : "opacity-100"}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-semibold text-slate-800 leading-tight">{card.name}</p>
                      <button className="text-slate-300 hover:text-slate-500 transition-colors ml-1 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mb-3 leading-tight">{card.company}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-slate-100 text-slate-500 rounded-md px-2 py-0.5">
                        {card.product}
                      </span>
                      <span className={`text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ${OWNER_COLORS[card.owner] ?? "bg-slate-100 text-slate-600"}`}>
                        {card.owner[0]}
                      </span>
                    </div>
                    <label className="mt-3 block">
                      <span className="sr-only">Move {card.name}</span>
                      <select
                        aria-label={`Move ${card.name}`}
                        value={card.column}
                        onChange={(e) => moveCard(card.id, e.target.value as CampaignBoardColumn)}
                        className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600 outline-none transition-colors hover:border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      >
                        {CAMPAIGN_BOARD_COLUMNS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ))}

                {colCards.length === 0 && (
                  <div className={`flex items-center justify-center h-16 rounded-xl border-2 border-dashed text-xs text-slate-300 transition-colors
                    ${isOver ? "border-indigo-300 text-indigo-300" : "border-slate-200"}`}>
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
