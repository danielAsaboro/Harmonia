import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  KeyboardEvent,
  JSX,
} from "react";

interface User {
  id: number;
  username: string;
  name: string;
}

interface Position {
  top: number;
  left: number;
}

interface FormattedTextPart {
  text: string;
  isMention: boolean;
  isValid: boolean;
}

const MentionInput: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [suggestionsPosition, setSuggestionsPosition] = useState<Position>({
    top: 0,
    left: 0,
  });
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validMentions, setValidMentions] = useState<Set<string>>(new Set());

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate API call with delay
  const fetchUsers = async (searchTerm: string): Promise<User[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock database with more users
    const allUsers: User[] = [
      { id: 1, username: "johndoe", name: "John Doe" },
      { id: 2, username: "janedoe", name: "Jane Doe" },
      { id: 3, username: "jacksmith", name: "Jack Smith" },
      { id: 4, username: "sarahconnor", name: "Sarah Connor" },
      { id: 5, username: "tonystark", name: "Tony Stark" },
      { id: 6, username: "peterparker", name: "Peter Parker" },
    ];

    // Simulate server-side filtering
    return allUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Check if a mention is valid
  const validateMention = async (username: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const users = await fetchUsers(username);
    return users.some((user) => user.username === username);
  };

  const getCursorCoordinates = (): Position => {
    const input = inputRef.current;
    if (!input) return { top: 0, left: 0 };

    const { offsetHeight: textAreaHeight } = input;
    const textAreaRect = input.getBoundingClientRect();

    // Position the suggestions below the input
    return {
      top: textAreaHeight + 5, // 5px gap
      left: 0,
    };
  };

  const handleInputChange = async (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    setCursorPosition(e.target.selectionStart || 0);

    const words = newText.slice(0, e.target.selectionStart).split(/\s/);
    const currentWord = words[words.length - 1];

    // Clear previous timeout to prevent multiple requests
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (currentWord.startsWith("@")) {
      const searchTerm = currentWord.slice(1);
      setIsLoading(true);

      // Debounce the API call
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const users = await fetchUsers(searchTerm);
          setSuggestions(users);
          setShowSuggestions(true);
          setSelectedIndex(0);

          const coords = getCursorCoordinates();
          if (coords) {
            setSuggestionsPosition(coords);
          }
        } catch (error) {
          console.error("Error fetching users:", error);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    } else {
      setShowSuggestions(false);
    }

    // Validate all mentions in the text
    const mentionRegex = /@(\w+)/g;
    const mentions = [...newText.matchAll(mentionRegex)];
    const newValidMentions = new Set(validMentions);

    for (const match of mentions) {
      const username = match[1];
      if (
        !validMentions.has(username) &&
        !Array.from(validMentions).includes(username)
      ) {
        const isValid = await validateMention(username);
        if (isValid) {
          newValidMentions.add(username);
        }
      }
    }
    setValidMentions(newValidMentions);
  };

  const insertMention = (username: string): void => {
    const words = inputText.slice(0, cursorPosition).split(/\s/);
    const beforeMention = words.slice(0, -1).join(" ");
    const afterMention = inputText.slice(cursorPosition);

    const spaceBefore = beforeMention.length > 0 ? " " : "";
    const spaceAfter = afterMention.length > 0 ? " " : "";

    const newText = `${beforeMention}${spaceBefore}@${username}${spaceAfter}${afterMention}`;
    setInputText(newText);
    setValidMentions((prev) => new Set([...prev, username]));
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          insertMention(suggestions[selectedIndex].username);
          setTimeout(() => {
            const newCursorPos = inputRef.current?.selectionStart || 0;
            setInputText((prev) => prev + " ");
            inputRef.current?.setSelectionRange(
              newCursorPos + 1,
              newCursorPos + 1
            );
          }, 0);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  // Format the display text with colored mentions
  const formatDisplayText = (): JSX.Element[] => {
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    const mentionRegex = /@(\w+)/g;
    let match: RegExpExecArray | null;

    while ((match = mentionRegex.exec(inputText)) !== null) {
      // Add text before the mention
      if (match.index > lastIndex) {
        parts.push(
          <span key={lastIndex}>{inputText.slice(lastIndex, match.index)}</span>
        );
      }

      // Add the colored mention
      const username = match[1];
      parts.push(
        <span
          key={match.index}
          className={
            validMentions.has(username) ? "text-blue-500" : "text-red-500"
          }
        >
          @{username}
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add any remaining text
    if (lastIndex < inputText.length) {
      parts.push(<span key={lastIndex}>{inputText.slice(lastIndex)}</span>);
    }

    return parts;
  };

  return (
    <div className="w-full max-w-xl relative">
      <div className="relative">
        <div className="w-full p-4 border rounded-lg shadow-sm min-h-[96px] whitespace-pre-wrap break-words">
          {formatDisplayText()}
        </div>
        <textarea
          ref={inputRef}
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type @ to mention someone..."
          className="w-full p-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 absolute top-0 left-0 right-0 bottom-0 bg-transparent"
          rows={3}
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          aria-controls="mentions-listbox"
        />
      </div>

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          id="mentions-listbox"
          role="listbox"
          aria-label="User suggestions"
          className="absolute bg-white border rounded-lg shadow-lg z-50 w-full max-w-md"
          style={{
            top: `${suggestionsPosition.top}px`,
            left: 0,
            width: "100%",
          }}
        >
          {isLoading ? (
            <div className="px-4 py-2 text-gray-500">Loading...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((user, index) => (
              <div
                key={user.id}
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => insertMention(user.username)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`px-4 py-2 cursor-pointer flex items-center space-x-2 ${
                  index === selectedIndex ? "bg-blue-100" : "hover:bg-gray-100"
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium">@{user.username}</div>
                  <div className="text-sm text-gray-500">{user.name}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No users found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MentionInput;
