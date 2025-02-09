// import React, { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";

// const systemPrompt = `You are a tweet thread composer that uses the Skeleton-of-Thought approach. 
// Your goal is to create engaging, informative tweet threads that maintain narrative cohesion while being easily digestible.
// Each tweet must be under 280 characters.`;

// const skeletonPrompt = `Create a skeleton outline for a tweet thread about: {topic}

// Rules:
// 1. Generate 3-7 main points
// 2. Each point should be 3-5 words
// 3. Points should flow logically
// 4. First tweet should be attention-grabbing
// 5. Last tweet should provide closure/call-to-action

// Output format:
// 1. [Point 1]
// 2. [Point 2]
// ...`;

// const expansionPrompt = `Expand this outline point into an engaging tweet (max 280 chars):
// Topic: {topic}
// Point: {point}
// Context: This is tweet {number} in a thread about {topic}

// Rules:
// 1. Stay under 280 characters
// 2. Be conversational yet informative
// 3. Use emojis appropriately
// 4. Include relevant hashtags if space permits
// 5. Maintain narrative flow with previous/next points`;

// const TweetThreadGenerator = () => {
//   const [topic, setTopic] = useState("");
//   const [skeleton, setSkeleton] = useState("");
//   const [expandedTweets, setExpandedTweets] = useState<string>([]);
//   const [isGenerating, setIsGenerating] = useState(false);

//   const generateSkeleton = async () => {
//     // In a real implementation, this would call your LLM API
//     setIsGenerating(true);
//     // Simulate API call delay
//     await new Promise((resolve) => setTimeout(resolve, 1000));
//     setSkeleton(`1. Introduce problem and solution
// 2. Share key benefits
// 3. Provide concrete example
// 4. Address common concerns
// 5. Call to action`);
//     setIsGenerating(false);
//   };

//   const expandTweets = async () => {
//     // In a real implementation, this would call your LLM API for each point
//     setIsGenerating(true);
//     // Simulate API call delay
//     await new Promise((resolve) => setTimeout(resolve, 1000));
//     // setExpandedTweets([
//     //   "🧵 Tired of writing disjointed tweet threads? Introducing Skeleton-of-Thought: a game-changing approach to crafting coherent, engaging threads that your followers will love! Here's how it works... (1/5)",
//     //   "🚀 Benefits:\n- Better narrative flow\n- Reduced mental load\n- Faster writing process\n- More engaging content\n- Consistent quality\n\nIt's like having an AI writing partner that helps you stay organized! (2/5)",
//     //   "📝 Example: Instead of diving in blind, start with a simple outline. For this thread, I mapped out 5 key points in just 2 minutes, then expanded each one thoughtfully. Notice the difference? (3/5)",
//     //   '❓ "But won\'t this make my tweets feel robotic?" Nope! The skeleton is just a guide. Your voice, experiences, and insights make each tweet unique. Think of it as a framework for creativity! (4/5)',
//     //   "Ready to transform your tweet game? Try the Skeleton-of-Thought approach for your next thread! Drop a 🔥 if you found this helpful.\n\n#TwitterTips #ContentCreation #ProductivityHacks (5/5)",
//     // ]);
//     setIsGenerating(false);
//   };

//   return (
//     <div className="space-y-4 w-full max-w-4xl">
//       <Card>
//         <CardHeader>
//           <CardTitle>Tweet Thread Generator</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-2">Topic</label>
//               <Textarea
//                 value={topic}
//                 onChange={(e) => setTopic(e.target.value)}
//                 placeholder="What would you like to create a thread about?"
//                 className="min-h-24"
//               />
//             </div>

//             <Button
//               onClick={generateSkeleton}
//               disabled={!topic || isGenerating}
//               className="w-full"
//             >
//               {isGenerating ? "Generating Skeleton..." : "Generate Skeleton"}
//             </Button>

//             {skeleton && (
//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                   Skeleton Outline
//                 </label>
//                 <div className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap">
//                   {skeleton}
//                 </div>
//                 <Button
//                   onClick={expandTweets}
//                   disabled={isGenerating}
//                   className="w-full mt-4"
//                 >
//                   {isGenerating ? "Expanding Tweets..." : "Expand into Tweets"}
//                 </Button>
//               </div>
//             )}

//             {expandedTweets.length > 0 && (
//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                   Generated Thread
//                 </label>
//                 <div className="space-y-2">
//                   {expandedTweets.map((tweet, index) => (
//                     <div key={index} className="bg-white border rounded-md p-4">
//                       {tweet}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default TweetThreadGenerator;
