import { useState } from "react";
import { Search, Edit, Trash2, Eye } from "lucide-react";

interface Member {
  id: number;
  name: string;
  skills: string[];
  bio: string;
  experience: string;
}

type SortField = "name" | "experience";

const INITIAL_MEMBERS: Member[] = [
  {
    id: 1,
    name: "Alex Nguyen",
    skills: ["RUST", "DEFI", "API Integration"],
    bio: "Alex specializes in building scalable RUST-based DEFI applications.",
    experience: "5 years",
  },
  {
    id: 2,
    name: "Linh Tran",
    skills: ["Smart Contracts", "Solidity", "Frontend Dev"],
    bio: "Linh has a strong background in DEFI and Solidity-based smart contract development.",
    experience: "3 years",
  },
];

export default function MembersTable() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filter members based on search term
  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.skills
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      member.bio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort members based on current sort field and order
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const compareValue = sortOrder === "asc" ? 1 : -1;
    if (a[sortBy] < b[sortBy]) return -compareValue;
    if (a[sortBy] > b[sortBy]) return compareValue;
    return 0;
  });

  // Handler functions
  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleDelete = (id: number) => {
    setMembers(members.filter((member) => member.id !== id));
  };

  return (
    <div className="w-full bg-[#1d1e22] rounded-xl p-4 md:p-6 overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-[#fcfdfe] text-xl md:text-2xl font-bold">
          Current Members
        </h2>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-grow md:flex-grow-0">
            <input
              type="text"
              className="w-full md:w-96 h-10 pl-10 pr-4 rounded border border-[#e3e7e7] bg-transparent text-white"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[#fcfdfe] text-sm md:text-base font-medium whitespace-nowrap">
              Sort by
            </span>
            <select
              className="w-full md:w-32 h-10 px-4 rounded border border-[#e3e7e7] bg-transparent text-[#fcfdfe]"
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as SortField)}
            >
              <option value="name">Name</option>
              <option value="experience">Experience</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table/Grid */}
      <div className="overflow-x-auto">
        {/* Header */}
        <div className="min-w-full grid grid-cols-12 gap-4 mb-4 text-lg font-medium text-[#fcfdfe] px-4">
          <div className="col-span-12 md:col-span-2">Name</div>
          <div className="col-span-12 md:col-span-3 hidden md:block">
            Skills
          </div>
          <div className="col-span-12 md:col-span-4 hidden md:block">Bio</div>
          <div className="col-span-12 md:col-span-2 hidden md:block">
            Experience
          </div>
          <div className="col-span-12 md:col-span-1 hidden md:block">
            Actions
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {sortedMembers.map((member) => (
            <div
              key={member.id}
              className="grid grid-cols-12 gap-4 text-sm text-[#bdbebf] p-4 hover:bg-gray-800 rounded-lg transition-colors"
            >
              {/* Mobile Layout */}
              <div className="col-span-12 md:hidden space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{member.name}</span>
                  <span>{member.experience}</span>
                </div>
                <div className="text-sm">{member.skills.join(", ")}</div>
                <div className="text-sm text-gray-400">{member.bio}</div>
                <div className="flex gap-2 justify-end">
                  <button className="p-1 hover:bg-gray-700 rounded">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="p-1 hover:bg-gray-700 rounded">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    className="p-1 hover:bg-gray-700 rounded"
                    onClick={() => handleDelete(member.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:block col-span-2">{member.name}</div>
              <div className="hidden md:block col-span-3">
                {member.skills.join(", ")}
              </div>
              <div className="hidden md:block col-span-4">{member.bio}</div>
              <div className="hidden md:block col-span-2">
                {member.experience}
              </div>
              <div className="hidden md:flex col-span-1 gap-2">
                <button className="p-1 hover:bg-gray-700 rounded">
                  <Eye className="w-5 h-5" />
                </button>
                <button className="p-1 hover:bg-gray-700 rounded">
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  className="p-1 hover:bg-gray-700 rounded"
                  onClick={() => handleDelete(member.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
