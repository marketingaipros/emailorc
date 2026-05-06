"use client";

import React, { useState } from "react";
import { MoreHorizontal, User } from "lucide-react";

type ColId =
  | "Uploaded"
  | "Ready"
  | "Draft Generated"
  | "Needs Review"
  | "Approved"
  | "Exported"
  | "Replied"
  | "Not Interested"
  | "Do Not Contact";

interface KanbanCard {
  id: number;
  name: string;
  company: string;
  product: string;
  owner: string;
  column: ColId;
}

const COLUMN_CONFIG: Record<ColId, { color: string; dot: string }> = {
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

const COLS: ColId[] = [
  "Uploaded", "Ready", "Draft Generated", "Needs Review",
  "Approved", "Exported", "Replied", "Not Interested", "Do Not Contact",
];

const INITIAL_CARDS: KanbanCard[] = [
  { id: 1,  name: "Sarah Johnson",  company: "Apex Logistics",      product: "Pro Plan",    owner: "JR", column: "Approved" },
  { id: 2,  name: "Marcus Webb",    company: "Greenfield Capital",   product: "Starter",     owner: "DK", column: "Approved" },
  { id: 3,  name: "Carlos Mena",    company: "Mena Retail Group",    product: "Starter",     owner: "DK", column: "Needs Review" },
  { id: 4,  name: "Olivia Stern",   company: "Stern & Associates",   product: "Enterprise",  owner: "JR", column: "Needs Review" },
  { id: 5,  name: "Rina Patel",     company: "BluePath Health",      product: "Growth Plan", owner: "JR", column: "Draft Generated" },
  { id: 6,  name: "Tom Hargrove",   company: "Hargrove.io",          product: "Pro Plan",    owner: "DK", column: "Draft Generated" },
  { id: 7,  name: "Janet Liu",      company: "Skyline Dev Co.",      product: "Pro Plan",    owner: "JR", column: "Ready" },
  { id: 8,  name: "Howard Grant",   company: "Grant Manufacturing",  product: "Enterprise",  owner: "DK", column: "Do Not Contact" },
  { id: 9,  name: "Priya Nair",     company: "NairTech Solutions",   product: "Starter",     owner: "JR", column: "Replied" },
  { id: 10, name: "Leon Brandt",    company: "Brandt Consulting",    product: "Pro Plan",    owner: "DK", column: "Uploaded" },
  { id: 11, name: "Amara Osei",     company: "Osei Ventures",        product: "Growth Plan", owner: "JR", column: "Exported" },
  { id: 12, name: "Chris Yamamoto", company: "Yama Digital",         product: "Starter",     owner: "DK", column: "Not Interested" },
];

const OWNER_COLORS: Record<string, string> = {
  JR: "bg-indigo-100 text-indigo-700",
  DK: "bg-purple-100 text-purple-700",
};

export default function CampaignBoardPage() {
  const [cards, setCards] = useState<KanbanCard[]>(INITIAL_CARDS);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<ColId | null>(null);

  const onDragStart = (id: number) => setDragging(id);
  const onDragOver = (e: React.DragEvent, col: ColId) => {
    e.preventDefault();
    setDragOver(col);
  };
  const onDrop = (col: ColId) => {
    if (dragging !== null) {
      setCards((prev) => prev.map((c) => (c.id === dragging ? { ...c, column: col } : c)));
    }
    setDragging(null);
    setDragOver(null);
  };
  const onDragEnd = () => { setDragging(null); setDragOver(null); };

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
        {COLS.map((col) => {
          const colCards = cards.filter((c) => c.column === col);
          const cfg = COLUMN_CONFIG[col];
          const isOver = dragOver === col;

          return (
            <div
              key={col}
              className="flex flex-col flex-shrink-0 w-56"
              onDragOver={(e) => onDragOver(e, col)}
              onDrop={() => onDrop(col)}
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
                    onDragStart={() => onDragStart(card.id)}
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
