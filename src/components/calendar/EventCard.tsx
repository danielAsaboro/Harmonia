// // /components/calendar/EventCard.tsx
// import React from "react";
// import { Card } from "../ui/card";
// import { cn } from "@/utils/ts-merge";
// import { CalendarEvent } from "./types";
// import { format } from "date-fns";

// interface EventCardProps {
//   event: CalendarEvent;
//   onDragStart?: (e: React.DragEvent) => void;
//   onDragEnd?: () => void;
//   onClick?: (e: React.MouseEvent) => void;
//   className?: string;
//   showTime?: boolean;
// }

// export const EventCard = React.memo(
//   ({
//     event,
//     onDragStart,
//     onDragEnd,
//     onClick,
//     className,
//     showTime = false,
//   }: EventCardProps) => {
//     const getEventTypeStyles = (type: CalendarEvent["type"]) => {
//       switch (type) {
//         case "community":
//           return "bg-green-50 border-green-200";
//         case "educational":
//           return "bg-purple-50 border-purple-200";
//         case "meme":
//           return "bg-pink-50 border-pink-200";
//         case "challenge":
//           return "bg-orange-50 border-orange-200";
//         default:
//           return "bg-blue-50 border-blue-200";
//       }
//     };

//     return (
//       <Card
//         draggable
//         onDragStart={onDragStart}
//         onDragEnd={onDragEnd}
//         onClick={(e) => {
//           e.stopPropagation();
//           onClick?.(e);
//         }}
//         className={cn(
//           "cursor-move p-1 transition-transform duration-150 hover:scale-105",
//           event.isEmptySlot
//             ? "border-dashed bg-gray-50"
//             : getEventTypeStyles(event.type),
//           className
//         )}
//       >
//         <div className="space-y-1">
//           {showTime && (
//             <div className="text-xs text-gray-500">
//               {format(new Date(event.start), "h:mm a")}
//             </div>
//           )}
//           <div className="text-xs font-medium truncate">{event.title}</div>
//           {event.tags && event.tags.length > 0 && (
//             <div className="flex gap-1 flex-wrap">
//               {event.tags.map((tag) => (
//                 <span
//                   key={tag}
//                   className="px-1 text-[10px] rounded bg-white/50"
//                 >
//                   {tag}
//                 </span>
//               ))}
//             </div>
//           )}
//         </div>
//       </Card>
//     );
//   }
// );

// EventCard.displayName = "EventCard";
