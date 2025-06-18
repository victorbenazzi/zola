"use client"

import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/prompt-kit/chat-container"
import { Loader } from "@/components/prompt-kit/loader"
import { ScrollButton } from "@/components/prompt-kit/scroll-button"
import { Message as MessageType } from "@ai-sdk/react"
import { Message } from "./message"

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
  const mockGroups: GroupedMessage[] = [
    {
      user: {
        id: crypto.randomUUID(),
        role: "user",
        content: "What is AI?",
        parts: [{ type: "text", text: "What is AI?" }],
      },
      responses: [
        {
          model: "GPT-4.1 Nano",
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "AI stands for Artificial Intelligence. It refers to machines that can perform tasks that typically require human intelligence, such as learning, reasoning, problem-solving, and understanding language. AI systems use algorithms and data to make decisions and predictions.",
            parts: [
              {
                type: "text",
                text: "AI stands for Artificial Intelligence. It refers to machines that can perform tasks that typically require human intelligence, such as learning, reasoning, problem-solving, and understanding language. AI systems use algorithms and data to make decisions and predictions.",
              },
            ],
          },
        },
        {
          model: "Claude 3.5 Sonnet",
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Artificial Intelligence is the field of computer science focused on creating systems that can perform tasks requiring human-like intelligence. This includes learning from experience, recognizing patterns, making decisions, and understanding natural language. Modern AI ranges from narrow applications like image recognition to more general systems.",
            parts: [
              {
                type: "text",
                text: "Artificial Intelligence is the field of computer science focused on creating systems that can perform tasks requiring human-like intelligence. This includes learning from experience, recognizing patterns, making decisions, and understanding natural language. Modern AI ranges from narrow applications like image recognition to more general systems.",
              },
            ],
          },
        },
        {
          model: "DeepSeek R1",
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "AI, or Artificial Intelligence, is the simulation of human intelligence in machines. It encompasses machine learning, neural networks, and deep learning techniques that enable computers to process information, learn from data, and make autonomous decisions across various domains.",
            parts: [
              {
                type: "text",
                text: "AI, or Artificial Intelligence, is the simulation of human intelligence in machines. It encompasses machine learning, neural networks, and deep learning techniques that enable computers to process information, learn from data, and make autonomous decisions across various domains.",
              },
            ],
          },
        },
        {
          model: "Mistral Large",
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Artificial Intelligence represents computer systems designed to mimic cognitive functions associated with human minds. These systems can perceive their environment, learn from experience, and adapt their behavior to achieve specific goals through advanced computational methods.",
            parts: [
              {
                type: "text",
                text: "Artificial Intelligence represents computer systems designed to mimic cognitive functions associated with human minds. These systems can perceive their environment, learn from experience, and adapt their behavior to achieve specific goals through advanced computational methods.",
              },
            ],
          },
        },
      ],
      status: "ready",
      onDelete: () => {},
      onEdit: () => {},
      onReload: () => {},
    },
    {
      user: {
        id: crypto.randomUUID(),
        role: "user",
        content: "Write a Python function to calculate fibonacci numbers",
        parts: [
          {
            type: "text",
            text: "Write a Python function to calculate fibonacci numbers",
          },
        ],
      },
      responses: [
        {
          model: "GPT-4.1 Nano",
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              'Here\'s a Python function to calculate Fibonacci numbers:\n\n```python\ndef fibonacci(n):\n    """Calculate the nth Fibonacci number"""\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\n# More efficient iterative version\ndef fibonacci_iterative(n):\n    if n <= 1:\n        return n\n    \n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b\n```',
            parts: [
              {
                type: "text",
                text: 'Here\'s a Python function to calculate Fibonacci numbers:\n\n```python\ndef fibonacci(n):\n    """Calculate the nth Fibonacci number"""\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\n# More efficient iterative version\ndef fibonacci_iterative(n):\n    if n <= 1:\n        return n\n    \n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b\n```',
              },
            ],
          },
        },
        {
          model: "Claude 3.5 Sonnet",
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Here are several approaches to calculate Fibonacci numbers in Python:\n\n```python\n# Recursive approach (simple but inefficient)\ndef fibonacci_recursive(n):\n    if n <= 1:\n        return n\n    return fibonacci_recursive(n-1) + fibonacci_recursive(n-2)\n\n# Iterative approach (efficient)\ndef fibonacci_iterative(n):\n    if n <= 1:\n        return n\n    prev, curr = 0, 1\n    for i in range(2, n + 1):\n        prev, curr = curr, prev + curr\n    return curr\n\n# Using memoization (recursive but efficient)\ndef fibonacci_memo(n, memo={}):\n    if n in memo:\n        return memo[n]\n    if n <= 1:\n        return n\n    memo[n] = fibonacci_memo(n-1, memo) + fibonacci_memo(n-2, memo)\n    return memo[n]\n```",
            parts: [
              {
                type: "text",
                text: "Here are several approaches to calculate Fibonacci numbers in Python:\n\n```python\n# Recursive approach (simple but inefficient)\ndef fibonacci_recursive(n):\n    if n <= 1:\n        return n\n    return fibonacci_recursive(n-1) + fibonacci_recursive(n-2)\n\n# Iterative approach (efficient)\ndef fibonacci_iterative(n):\n    if n <= 1:\n        return n\n    prev, curr = 0, 1\n    for i in range(2, n + 1):\n        prev, curr = curr, prev + curr\n    return curr\n\n# Using memoization (recursive but efficient)\ndef fibonacci_memo(n, memo={}):\n    if n in memo:\n        return memo[n]\n    if n <= 1:\n        return n\n    memo[n] = fibonacci_memo(n-1, memo) + fibonacci_memo(n-2, memo)\n    return memo[n]\n```",
              },
            ],
          },
        },
        {
          model: "DeepSeek R1",
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              'Here\'s an efficient Python function for Fibonacci numbers:\n\n```python\ndef fibonacci(n):\n    """Generate the nth Fibonacci number using iteration."""\n    if n < 0:\n        raise ValueError("n must be non-negative")\n    elif n <= 1:\n        return n\n    \n    # Initialize first two values\n    fib_prev, fib_curr = 0, 1\n    \n    # Calculate iteratively\n    for i in range(2, n + 1):\n        fib_next = fib_prev + fib_curr\n        fib_prev, fib_curr = fib_curr, fib_next\n    \n    return fib_curr\n\n# Generator for Fibonacci sequence\ndef fibonacci_sequence(limit):\n    a, b = 0, 1\n    while a < limit:\n        yield a\n        a, b = b, a + b\n```',
            parts: [
              {
                type: "text",
                text: 'Here\'s an efficient Python function for Fibonacci numbers:\n\n```python\ndef fibonacci(n):\n    """Generate the nth Fibonacci number using iteration."""\n    if n < 0:\n        raise ValueError("n must be non-negative")\n    elif n <= 1:\n        return n\n    \n    # Initialize first two values\n    fib_prev, fib_curr = 0, 1\n    \n    # Calculate iteratively\n    for i in range(2, n + 1):\n        fib_next = fib_prev + fib_curr\n        fib_prev, fib_curr = fib_curr, fib_next\n    \n    return fib_curr\n\n# Generator for Fibonacci sequence\ndef fibonacci_sequence(limit):\n    a, b = 0, 1\n    while a < limit:\n        yield a\n        a, b = b, a + b\n```',
              },
            ],
          },
        },
      ],
      status: "ready",
      onDelete: () => {},
      onEdit: () => {},
      onReload: () => {},
    },
    {
      user: {
        id: crypto.randomUUID(),
        role: "user",
        content: "What are the main differences between React and Vue.js?",
        parts: [
          {
            type: "text",
            text: "What are the main differences between React and Vue.js?",
          },
        ],
      },
      responses: [
        {
          model: "GPT-4.1 Nano",
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Here are the key differences between React and Vue.js:\n\n**React:**\n- Developed by Facebook\n- Uses JSX syntax\n- Component-based architecture\n- One-way data binding\n- Larger ecosystem and community\n- Steeper learning curve\n- More job opportunities\n\n**Vue.js:**\n- Progressive framework\n- Template-based syntax (more HTML-like)\n- Two-way data binding by default\n- Easier to learn for beginners\n- Better documentation\n- Smaller bundle size\n- More opinionated structure\n\nBoth are excellent choices, with React being more popular in enterprise and Vue.js being more beginner-friendly.",
            parts: [
              {
                type: "text",
                text: "Here are the key differences between React and Vue.js:\n\n**React:**\n- Developed by Facebook\n- Uses JSX syntax\n- Component-based architecture\n- One-way data binding\n- Larger ecosystem and community\n- Steeper learning curve\n- More job opportunities\n\n**Vue.js:**\n- Progressive framework\n- Template-based syntax (more HTML-like)\n- Two-way data binding by default\n- Easier to learn for beginners\n- Better documentation\n- Smaller bundle size\n- More opinionated structure\n\nBoth are excellent choices, with React being more popular in enterprise and Vue.js being more beginner-friendly.",
              },
            ],
          },
        },
        {
          model: "Claude 3.5 Sonnet",
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "React and Vue.js differ in several key areas:\n\n**Learning Curve & Syntax:**\n- React uses JSX, requiring JavaScript knowledge\n- Vue uses template syntax closer to HTML, easier for designers\n\n**Architecture:**\n- React is a library focused on UI rendering\n- Vue is a progressive framework with more built-in features\n\n**State Management:**\n- React relies on external libraries (Redux, Zustand)\n- Vue includes Vuex/Pinia as official state management\n\n**Performance:**\n- React uses virtual DOM with reconciliation\n- Vue uses virtual DOM with more optimized reactivity system\n\n**Ecosystem:**\n- React has larger community and more third-party libraries\n- Vue has more official packages and cohesive ecosystem\n\n**Development Experience:**\n- React offers more flexibility but requires more decisions\n- Vue provides more conventions and structure out of the box",
            parts: [
              {
                type: "text",
                text: "React and Vue.js differ in several key areas:\n\n**Learning Curve & Syntax:**\n- React uses JSX, requiring JavaScript knowledge\n- Vue uses template syntax closer to HTML, easier for designers\n\n**Architecture:**\n- React is a library focused on UI rendering\n- Vue is a progressive framework with more built-in features\n\n**State Management:**\n- React relies on external libraries (Redux, Zustand)\n- Vue includes Vuex/Pinia as official state management\n\n**Performance:**\n- React uses virtual DOM with reconciliation\n- Vue uses virtual DOM with more optimized reactivity system\n\n**Ecosystem:**\n- React has larger community and more third-party libraries\n- Vue has more official packages and cohesive ecosystem\n\n**Development Experience:**\n- React offers more flexibility but requires more decisions\n- Vue provides more conventions and structure out of the box",
              },
            ],
          },
        },
      ],
      status: "ready",
      onDelete: () => {},
      onEdit: () => {},
      onReload: () => {},
    },
    {
      user: {
        id: crypto.randomUUID(),
        role: "user",
        content: "Explain quantum computing in simple terms",
        parts: [
          { type: "text", text: "Explain quantum computing in simple terms" },
        ],
      },
      responses: [
        {
          model: "GPT-4.1 Nano",
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Quantum computing is like having a super-powered computer that works differently from regular computers.\n\n**Regular computers** use bits that are either 0 or 1, like light switches that are either on or off.\n\n**Quantum computers** use quantum bits (qubits) that can be 0, 1, or both at the same time - like a spinning coin that's both heads and tails until it lands.\n\nThis allows quantum computers to:\n- Try many solutions simultaneously\n- Solve certain problems exponentially faster\n- Break current encryption methods\n- Simulate molecular behavior for drug discovery\n\nHowever, they're extremely sensitive to interference and only work at temperatures colder than outer space. They're not meant to replace regular computers but to solve specific complex problems that would take classical computers thousands of years.",
            parts: [
              {
                type: "text",
                text: "Quantum computing is like having a super-powered computer that works differently from regular computers.\n\n**Regular computers** use bits that are either 0 or 1, like light switches that are either on or off.\n\n**Quantum computers** use quantum bits (qubits) that can be 0, 1, or both at the same time - like a spinning coin that's both heads and tails until it lands.\n\nThis allows quantum computers to:\n- Try many solutions simultaneously\n- Solve certain problems exponentially faster\n- Break current encryption methods\n- Simulate molecular behavior for drug discovery\n\nHowever, they're extremely sensitive to interference and only work at temperatures colder than outer space. They're not meant to replace regular computers but to solve specific complex problems that would take classical computers thousands of years.",
              },
            ],
          },
        },
        {
          model: "Claude 3.5 Sonnet",
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Think of quantum computing like the difference between walking through a maze versus being able to explore all paths simultaneously.\n\n**Classical computers** are like walking through one path at a time:\n- Process information sequentially\n- Each bit is definitively 0 or 1\n- Very reliable but limited for complex problems\n\n**Quantum computers** are like exploring all maze paths at once:\n- Use qubits that exist in \"superposition\" (multiple states simultaneously)\n- Can process vast combinations of possibilities in parallel\n- Leverage quantum entanglement where particles remain mysteriously connected\n\n**Real-world applications:**\n- Drug discovery (simulating molecular interactions)\n- Cryptography (breaking and creating new security)\n- Financial modeling (analyzing market risks)\n- Climate modeling (processing complex atmospheric data)\n\n**Current limitations:**\n- Extremely fragile - any disturbance breaks the quantum state\n- Only useful for specific types of problems\n- Require near absolute zero temperatures\n- Still in early experimental stages\n\nQuantum computers won't replace laptops but will revolutionize how we approach the world's most complex computational challenges.",
            parts: [
              {
                type: "text",
                text: "Think of quantum computing like the difference between walking through a maze versus being able to explore all paths simultaneously.\n\n**Classical computers** are like walking through one path at a time:\n- Process information sequentially\n- Each bit is definitively 0 or 1\n- Very reliable but limited for complex problems\n\n**Quantum computers** are like exploring all maze paths at once:\n- Use qubits that exist in \"superposition\" (multiple states simultaneously)\n- Can process vast combinations of possibilities in parallel\n- Leverage quantum entanglement where particles remain mysteriously connected\n\n**Real-world applications:**\n- Drug discovery (simulating molecular interactions)\n- Cryptography (breaking and creating new security)\n- Financial modeling (analyzing market risks)\n- Climate modeling (processing complex atmospheric data)\n\n**Current limitations:**\n- Extremely fragile - any disturbance breaks the quantum state\n- Only useful for specific types of problems\n- Require near absolute zero temperatures\n- Still in early experimental stages\n\nQuantum computers won't replace laptops but will revolutionize how we approach the world's most complex computational challenges.",
              },
            ],
          },
        },
      ],
      status: "ready",
      onDelete: () => {},
      onEdit: () => {},
      onReload: () => {},
    },
    {
      user: {
        id: crypto.randomUUID(),
        role: "user",
        content: "How do I make a perfect cup of coffee?",
        parts: [
          { type: "text", text: "How do I make a perfect cup of coffee?" },
        ],
      },
      responses: [
        {
          model: "GPT-4.1 Nano",
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Here's how to make a perfect cup of coffee:\n\n**Essential Elements:**\n1. **Quality beans** - Buy whole beans, roasted within 2-4 weeks\n2. **Proper grind** - Grind just before brewing, medium-fine for drip\n3. **Water quality** - Use filtered water, 195-205°F (90-96°C)\n4. **Coffee ratio** - 1:15 to 1:17 ratio (coffee to water)\n\n**Pour-Over Method:**\n1. Heat water to 200°F\n2. Grind 22g coffee beans (medium-fine)\n3. Place filter in dripper, rinse with hot water\n4. Add coffee, create a small well in center\n5. Pour 50ml water in circular motion, let bloom 30 seconds\n6. Slowly pour remaining 330ml water in circular motions\n7. Total brew time: 3-4 minutes\n\n**Tips:**\n- Store beans in airtight container, away from light\n- Clean equipment regularly\n- Experiment with grind size and timing\n- Taste and adjust to your preference",
            parts: [
              {
                type: "text",
                text: "Here's how to make a perfect cup of coffee:\n\n**Essential Elements:**\n1. **Quality beans** - Buy whole beans, roasted within 2-4 weeks\n2. **Proper grind** - Grind just before brewing, medium-fine for drip\n3. **Water quality** - Use filtered water, 195-205°F (90-96°C)\n4. **Coffee ratio** - 1:15 to 1:17 ratio (coffee to water)\n\n**Pour-Over Method:**\n1. Heat water to 200°F\n2. Grind 22g coffee beans (medium-fine)\n3. Place filter in dripper, rinse with hot water\n4. Add coffee, create a small well in center\n5. Pour 50ml water in circular motion, let bloom 30 seconds\n6. Slowly pour remaining 330ml water in circular motions\n7. Total brew time: 3-4 minutes\n\n**Tips:**\n- Store beans in airtight container, away from light\n- Clean equipment regularly\n- Experiment with grind size and timing\n- Taste and adjust to your preference",
              },
            ],
          },
        },
        {
          model: "Claude 3.5 Sonnet",
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "The perfect cup of coffee depends on your taste preferences, but here are the fundamentals:\n\n**The Foundation:**\n- **Fresh, quality beans**: Single-origin or specialty blends, roasted 1-4 weeks ago\n- **Proper storage**: Airtight container, room temperature, away from light\n- **Good water**: Filtered water makes a huge difference (96% of coffee is water!)\n\n**The Golden Ratio:**\n- **1:15 to 1:17** coffee-to-water ratio\n- For example: 30g coffee to 450-500ml water\n\n**Brewing Steps (Pour-Over):**\n1. **Grind**: Medium-fine, just before brewing\n2. **Heat**: Water to 195-205°F (just off boiling)\n3. **Rinse**: Paper filter with hot water\n4. **Bloom**: Pour twice the weight of water as coffee, wait 30-45 seconds\n5. **Pour**: Slow, steady circles, finishing brew in 4-6 minutes\n\n**Variables to Adjust:**\n- Grind size (finer = stronger, coarser = weaker)\n- Water temperature (hotter = more extraction)\n- Brew time (longer = stronger)\n- Coffee amount (more coffee = stronger)\n\n**Pro tip**: Keep notes on what you like! Coffee is personal, so adjust these parameters to find your perfect cup.",
            parts: [
              {
                type: "text",
                text: "The perfect cup of coffee depends on your taste preferences, but here are the fundamentals:\n\n**The Foundation:**\n- **Fresh, quality beans**: Single-origin or specialty blends, roasted 1-4 weeks ago\n- **Proper storage**: Airtight container, room temperature, away from light\n- **Good water**: Filtered water makes a huge difference (96% of coffee is water!)\n\n**The Golden Ratio:**\n- **1:15 to 1:17** coffee-to-water ratio\n- For example: 30g coffee to 450-500ml water\n\n**Brewing Steps (Pour-Over):**\n1. **Grind**: Medium-fine, just before brewing\n2. **Heat**: Water to 195-205°F (just off boiling)\n3. **Rinse**: Paper filter with hot water\n4. **Bloom**: Pour twice the weight of water as coffee, wait 30-45 seconds\n5. **Pour**: Slow, steady circles, finishing brew in 4-6 minutes\n\n**Variables to Adjust:**\n- Grind size (finer = stronger, coarser = weaker)\n- Water temperature (hotter = more extraction)\n- Brew time (longer = stronger)\n- Coffee amount (more coffee = stronger)\n\n**Pro tip**: Keep notes on what you like! Coffee is personal, so adjust these parameters to find your perfect cup.",
              },
            ],
          },
        },
      ],
      status: "ready",
      onDelete: () => {},
      onEdit: () => {},
      onReload: () => {},
    },
    {
      user: {
        id: crypto.randomUUID(),
        role: "user",
        content: "What's the current status of this conversation?",
        parts: [
          {
            type: "text",
            text: "What's the current status of this conversation?",
          },
        ],
      },
      responses: [
        {
          model: "GPT-4.1 Nano",
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "I'm currently generating a response to your question...",
            parts: [
              {
                type: "text",
                text: "I'm currently generating a response to your question...",
              },
            ],
          },
        },
        {
          model: "Claude 3.5 Sonnet",
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Processing your request, please wait...",
            parts: [
              {
                type: "text",
                text: "Processing your request, please wait...",
              },
            ],
          },
        },
      ],
      status: "streaming",
      onDelete: () => {},
      onEdit: () => {},
      onReload: () => {},
    },
  ]

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
