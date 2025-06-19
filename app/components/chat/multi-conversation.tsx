"use client"

import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/prompt-kit/chat-container"
import { Loader } from "@/components/prompt-kit/loader"
import { ScrollButton } from "@/components/prompt-kit/scroll-button"
import { Message as MessageType } from "@ai-sdk/react"
import { Message } from "./message"

type Chat = {
  id: string
  model: string
}

type RawMessage = {
  id: number
  chat_id: string
  role: "user" | "assistant"
  content: string
  message_group_id: string
}

type GroupedMessage = {
  user: MessageType
  responses: {
    model: string
    message: MessageType
  }[]
  status?: "streaming" | "ready" | "submitted" | "error"
  onDelete: (model: string, id: string) => void
  onEdit: (model: string, id: string, newText: string) => void
  onReload: (model: string) => void
}

export function MultiModelConversation() {
  // Mock chats table (1 per model)
  const mockChats: Chat[] = [
    { id: "chat1", model: "GPT-4" },
    { id: "chat2", model: "Claude 3.5 Sonnet" },
    { id: "chat3", model: "DeepSeek R1" },
    { id: "chat4", model: "Mistral Large" },
  ]

  // Mock messages table (raw, ungrouped)
  const mockMessages: RawMessage[] = [
    // Group A: "What is AI?" to multiple models
    {
      id: 1,
      chat_id: "chat1",
      role: "user",
      content: "What is AI?",
      message_group_id: "groupA",
    },
    {
      id: 2,
      chat_id: "chat2",
      role: "user",
      content: "What is AI?",
      message_group_id: "groupA",
    },
    {
      id: 3,
      chat_id: "chat3",
      role: "user",
      content: "What is AI?",
      message_group_id: "groupA",
    },
    {
      id: 11111,
      chat_id: "chat3",
      role: "user",
      content: "What is AI?",
      message_group_id: "groupA",
    },
    {
      id: 4,
      chat_id: "chat1",
      role: "assistant",
      content:
        "AI stands for Artificial Intelligence. It refers to machines that can perform tasks that typically require human intelligence, such as learning, reasoning, problem-solving, and understanding language. AI systems use algorithms and data to make decisions and predictions.",
      message_group_id: "groupA",
    },
    {
      id: 5,
      chat_id: "chat2",
      role: "assistant",
      content:
        "Artificial Intelligence is the field of computer science focused on creating systems that can perform tasks requiring human-like intelligence. This includes learning from experience, recognizing patterns, making decisions, and understanding natural language. Modern AI ranges from narrow applications like image recognition to more general systems.",
      message_group_id: "groupA",
    },
    {
      id: 6,
      chat_id: "chat3",
      role: "assistant",
      content:
        "AI, or Artificial Intelligence, is the simulation of human intelligence in machines. It encompasses machine learning, neural networks, and deep learning techniques that enable computers to process information, learn from data, and make autonomous decisions across various domains.",
      message_group_id: "groupA",
    },

    // Group B: "Write a Python function for fibonacci" to some models
    {
      id: 7,
      chat_id: "chat1",
      role: "user",
      content: "Write a Python function to calculate fibonacci numbers",
      message_group_id: "groupB",
    },
    {
      id: 8,
      chat_id: "chat2",
      role: "user",
      content: "Write a Python function to calculate fibonacci numbers",
      message_group_id: "groupB",
    },
    {
      id: 9,
      chat_id: "chat4",
      role: "user",
      content: "Write a Python function to calculate fibonacci numbers",
      message_group_id: "groupB",
    },
    {
      id: 10,
      chat_id: "chat1",
      role: "assistant",
      content:
        'Here\'s a Python function to calculate Fibonacci numbers:\n\n```python\ndef fibonacci(n):\n    """Calculate the nth Fibonacci number"""\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\n# More efficient iterative version\ndef fibonacci_iterative(n):\n    if n <= 1:\n        return n\n    \n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b\n```',
      message_group_id: "groupB",
    },
    {
      id: 11,
      chat_id: "chat2",
      role: "assistant",
      content:
        "Here are several approaches to calculate Fibonacci numbers in Python:\n\n```python\n# Recursive approach (simple but inefficient)\ndef fibonacci_recursive(n):\n    if n <= 1:\n        return n\n    return fibonacci_recursive(n-1) + fibonacci_recursive(n-2)\n\n# Iterative approach (efficient)\ndef fibonacci_iterative(n):\n    if n <= 1:\n        return n\n    prev, curr = 0, 1\n    for i in range(2, n + 1):\n        prev, curr = curr, prev + curr\n    return curr\n\n# Using memoization (recursive but efficient)\ndef fibonacci_memo(n, memo={}):\n    if n in memo:\n        return memo[n]\n    if n <= 1:\n        return n\n    memo[n] = fibonacci_memo(n-1, memo) + fibonacci_memo(n-2, memo)\n    return memo[n]\n```",
      message_group_id: "groupB",
    },
    {
      id: 12,
      chat_id: "chat4",
      role: "assistant",
      content:
        'Here\'s an efficient Python function for Fibonacci numbers:\n\n```python\ndef fibonacci(n):\n    """Generate the nth Fibonacci number using iteration."""\n    if n < 0:\n        raise ValueError("n must be non-negative")\n    elif n <= 1:\n        return n\n    \n    # Initialize first two values\n    fib_prev, fib_curr = 0, 1\n    \n    # Calculate iteratively\n    for i in range(2, n + 1):\n        fib_next = fib_prev + fib_curr\n        fib_prev, fib_curr = fib_curr, fib_next\n    \n    return fib_curr\n\n# Generator for Fibonacci sequence\ndef fibonacci_sequence(limit):\n    a, b = 0, 1\n    while a < limit:\n        yield a\n        a, b = b, a + b\n```',
      message_group_id: "groupB",
    },

    // Group C: "Explain quantum computing" to fewer models
    {
      id: 13,
      chat_id: "chat2",
      role: "user",
      content: "Explain quantum computing in simple terms",
      message_group_id: "groupC",
    },
    {
      id: 14,
      chat_id: "chat3",
      role: "user",
      content: "Explain quantum computing in simple terms",
      message_group_id: "groupC",
    },
    {
      id: 15,
      chat_id: "chat2",
      role: "assistant",
      content:
        'Think of quantum computing like the difference between walking through a maze versus being able to explore all paths simultaneously.\n\n**Classical computers** are like walking through one path at a time:\n- Process information sequentially\n- Each bit is definitively 0 or 1\n- Very reliable but limited for complex problems\n\n**Quantum computers** are like exploring all maze paths at once:\n- Use qubits that exist in "superposition" (multiple states simultaneously)\n- Can process vast combinations of possibilities in parallel\n- Leverage quantum entanglement where particles remain mysteriously connected\n\n**Real-world applications:**\n- Drug discovery (simulating molecular interactions)\n- Cryptography (breaking and creating new security)\n- Financial modeling (analyzing market risks)\n- Climate modeling (processing complex atmospheric data)',
      message_group_id: "groupC",
    },
    {
      id: 16,
      chat_id: "chat3",
      role: "assistant",
      content:
        "Quantum computing is like having a super-powered computer that works differently from regular computers.\n\n**Regular computers** use bits that are either 0 or 1, like light switches that are either on or off.\n\n**Quantum computers** use quantum bits (qubits) that can be 0, 1, or both at the same time - like a spinning coin that's both heads and tails until it lands.\n\nThis allows quantum computers to:\n- Try many solutions simultaneously\n- Solve certain problems exponentially faster\n- Break current encryption methods\n- Simulate molecular behavior for drug discovery\n\nHowever, they're extremely sensitive to interference and only work at temperatures colder than outer space.",
      message_group_id: "groupC",
    },

    // Group D: "Best practices for React" to single model
    {
      id: 17,
      chat_id: "chat1",
      role: "user",
      content: "What are some React best practices?",
      message_group_id: "groupD",
    },
    {
      id: 18,
      chat_id: "chat1",
      role: "assistant",
      content:
        "Here are key React best practices:\n\n**Component Structure:**\n- Keep components small and focused on a single responsibility\n- Use functional components with hooks over class components\n- Prefer composition over inheritance\n\n**State Management:**\n- Use useState for local state, useContext for shared state\n- Consider external state management (Redux, Zustand) for complex apps\n- Keep state as close to where it's used as possible\n\n**Performance:**\n- Use React.memo() for expensive components\n- Implement useCallback and useMemo for optimization\n- Avoid creating objects/functions in render\n\n**Code Quality:**\n- Use TypeScript for better type safety\n- Implement proper error boundaries\n- Write meaningful component and prop names\n- Use ESLint and Prettier for consistent code style",
      message_group_id: "groupD",
    },

    // Group E: "Streaming example" - showing a model still responding
    {
      id: 19,
      chat_id: "chat1",
      role: "user",
      content: "What's the future of web development?",
      message_group_id: "groupE",
    },
    {
      id: 20,
      chat_id: "chat2",
      role: "user",
      content: "What's the future of web development?",
      message_group_id: "groupE",
    },
    {
      id: 21,
      chat_id: "chat1",
      role: "assistant",
      content:
        "The future of web development is being shaped by several key trends:\n\n**Frontend Evolution:**\n- Server-side rendering (SSR) and static site generation (SSG) are becoming standard\n- Component-driven architecture with design systems\n- Progressive Web Apps (PWAs) bridging native and web experiences\n\n**Performance & UX:**\n- Core Web Vitals and performance-first development\n- Advanced caching strategies and edge computing\n- Micro-frontends for large-scale applications\n\n**AI Integration:**\n- AI-powered code generation and debugging tools\n- Intelligent user interfaces that adapt to user behavior\n- Automated testing and optimization",
      message_group_id: "groupE",
    },
    {
      id: 22,
      chat_id: "chat2",
      role: "assistant",
      content: "I'm analyzing the current trends and emerging technologies...",
      message_group_id: "groupE",
    },
  ]

  // Function to group messages by message_group_id
  const groupMessagesByGroupId = (): GroupedMessage[] => {
    const groups: { [key: string]: RawMessage[] } = {}

    // Group messages by message_group_id
    mockMessages.forEach((message) => {
      if (!groups[message.message_group_id]) {
        groups[message.message_group_id] = []
      }
      groups[message.message_group_id].push(message)
    })

    // Convert to GroupedMessage format
    return Object.entries(groups).map(([groupId, messages]) => {
      const userMessage = messages.find((m) => m.role === "user")
      const assistantMessages = messages.filter((m) => m.role === "assistant")

      if (!userMessage) {
        throw new Error(`No user message found for group ${groupId}`)
      }

      // Determine status based on whether all models have responded
      const isStreaming =
        groupId === "groupE" &&
        assistantMessages.some(
          (m) => m.content.includes("analyzing") || m.content.includes("...")
        )

      return {
        user: {
          id: userMessage.id.toString(),
          role: "user" as const,
          content: userMessage.content,
          parts: [{ type: "text" as const, text: userMessage.content }],
        },
        responses: assistantMessages.map((assistantMsg) => {
          const chat = mockChats.find((c) => c.id === assistantMsg.chat_id)
          return {
            model: chat?.model || "Unknown Model",
            message: {
              id: assistantMsg.id.toString(),
              role: "assistant" as const,
              content: assistantMsg.content,
              parts: [{ type: "text" as const, text: assistantMsg.content }],
            },
          }
        }),
        status: isStreaming ? "streaming" : "ready",
        onDelete: () => {},
        onEdit: () => {},
        onReload: () => {},
      }
    })
  }

  const mockGroups = groupMessagesByGroupId()

  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-y-auto">
      <ChatContainerRoot className="relative w-full">
        <ChatContainerContent
          className="flex w-full flex-col items-center pt-20 pb-4"
          style={{
            scrollbarGutter: "stable both-edges",
            scrollbarWidth: "none",
          }}
        >
          {mockGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-10 w-full space-y-3">
              <div className="mx-auto w-full max-w-3xl">
                <Message
                  id={group.user.id}
                  variant="user"
                  parts={group.user.parts}
                  attachments={group.user.experimental_attachments}
                  onDelete={() => {}}
                  onEdit={() => {}}
                  onReload={() => {}}
                  status="ready"
                >
                  {group.user.content}
                </Message>
              </div>

              <div className="mx-auto flex w-full max-w-[1800px] space-x-4 overflow-x-auto px-6">
                {group.responses.map((res) => (
                  <div
                    key={res.model}
                    className="bg-muted max-w-[420px] min-w-[360px] flex-shrink-0 rounded border p-3"
                  >
                    <div className="text-muted-foreground mb-2 text-xs font-medium">
                      {res.model}
                    </div>

                    <Message
                      id={res.message.id}
                      variant="assistant"
                      parts={res.message.parts}
                      attachments={res.message.experimental_attachments}
                      onDelete={() => group.onDelete(res.model, res.message.id)}
                      onEdit={(id, newText) =>
                        group.onEdit(res.model, id, newText)
                      }
                      onReload={() => group.onReload(res.model)}
                      status={group.status || "ready"}
                      isLast={false}
                      hasScrollAnchor={false}
                    >
                      {res.message.content}
                    </Message>
                  </div>
                ))}
              </div>

              {group.status === "submitted" && (
                <div className="group min-h-scroll-anchor flex w-full flex-col items-start gap-2 px-6 pb-2">
                  <Loader />
                </div>
              )}
            </div>
          ))}
          <div className="absolute bottom-0 flex w-full max-w-3xl flex-1 items-end justify-end gap-4 px-6 pb-2">
            <ScrollButton className="absolute top-[-50px] right-[30px]" />
          </div>
        </ChatContainerContent>
      </ChatContainerRoot>
    </div>
  )
}
