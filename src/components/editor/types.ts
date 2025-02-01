import { Tweet } from "@/types/tweet";

export interface SidebarContentProps {
  tweets: Tweet[];
  selectedPostId: string | null;
  setSelectedPostId: (id: string | null) => void;
}
