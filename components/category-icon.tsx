import React from "react";
import {
  FileText,
  PartyPopper,
  Users,
  Trees,
  MonitorSmartphone,
  MapPinned,
  Briefcase,
  Calendar,
  Clock,
  FolderHeart,
  Camera,
  Folder,
} from "lucide-react";

type CategoryIconProps = {
  icon?: string | null;
  className?: string;
};

export function CategoryIcon({ icon, className = "h-4 w-4" }: CategoryIconProps) {
  if (!icon) return <Folder className={className} />;

  const key = icon.toLowerCase().replace(/[^a-z0-9]/g, "");

  switch (key) {
    case "filetext":
    case "documents":
    case "file":
      return <FileText className={className} />;
    case "partypopper":
    case "events":
    case "party":
      return <PartyPopper className={className} />;
    case "usersround":
    case "users":
    case "people":
    case "groups":
      return <Users className={className} />;
    case "trees":
    case "nature":
    case "tree":
      return <Trees className={className} />;
    case "monitorsmartphone":
    case "screenshots":
    case "screen":
      return <MonitorSmartphone className={className} />;
    case "mappinned":
    case "travel":
    case "map":
      return <MapPinned className={className} />;
    case "briefcase":
    case "work":
      return <Briefcase className={className} />;
    case "calendar":
      return <Calendar className={className} />;
    case "clock":
    case "recentlyadded":
      return <Clock className={className} />;
    case "folderheart":
    case "favorites":
      return <FolderHeart className={className} />;
    case "camera":
      return <Camera className={className} />;
    default:
      // If it's an emoji or short symbol
      if (icon.length <= 4) {
        return <span className="text-base leading-none select-none">{icon}</span>;
      }
      return <Folder className={className} />;
  }
}
