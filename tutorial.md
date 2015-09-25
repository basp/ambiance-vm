A stack machine is a virtual machine or chip that can perform stack based
processing of instructions. And yeah this is a useless and somewhat recursive
definition.

### The Stack
When we talk about the stack and stack based virtual machines we're talking 
about the value stack. It's basically the thing that a processor or virtual 
machine uses to *remember* stuff from before. Just note that using a stack is
not the only way of doing things but it's easy to program so that's why we're
using it right now. Who cares about efficiency anyway? Well actually we do but
we'll worry about that later.

We can imagine the stack very easily. Just picture a stack of plates. Except,
in our case every place is a value. For our purposes a value can be anything or
in TypeScript: `any`. Yeah, we're easy like that.

In a stack based machine we'll usually push things awkwardly to the stack just
to make programming easier. It's one of the reasons why assembly is considered
so awkward to many people because in fact what we're about to do is very much
like assembly. 

### Assembly
Assembly is basically the lowest form of instructing a computer that is still 
considered humanly readable. It's one step below below programming languages 
and one step above machine code (which is out of scope). 

Assembly is so low level that it resembles the way a processor works. You setup
some *environment* for your instruction and then tell the processor to execute
the instruction. And on the next *tick* it will read the instruction, then use
the environment that you setup to execute it and go on to the next instruction.

Assembly looks a bit like this (very simplified):

	PUSH	2
	PUSH	3
	ADD
	RET
	
You'll see why this is useful to know in a bit. Oh and you'll probably won't 
seem assembly this understandable but that's because most real world assembly
deals with register based machiens (out of scope) and most processor
architectures have specialized syntax. So real life assembly will usually look
a whole lot more arcane. Don't worry about that, it won't hamper your
understanding of computers in any way.

### Side Effects
By the way, computers are so powerful because we can remember stuff between
these individual instructions while the thing that is executing them does not.

As far as the central processing unit (CPU) is concerned every cycle is the same 
as every other cycle. But as things change around this unit the effects of the
instructions it is performing have various consequences. 

### Tale of Two Morons
A long long time ago there were two people and each had a baffling deficiency.
CPUnit was able to calculate simple things but could remember only two things.
Stackmem wasn't able to calculate anything but she had an amazing memory and 
could remember everything, although in a strange way.

The peculiar thing was that Stackmem would forget something as soon as you asked 
her and he would only remember the the last thing you told her. Right after you 
asked her she would usually forget it straight away. The next time you would ask 
her for the last thing she remembered she would fall back to the thing she 
remembered right before that.

In other terms, her memory was like a *stack* of plates. Each time CPUnit asked 
her to remember something another plate would go on top and (almost) every 
time you asked her for her last memory the plate would vanish and she would revert 
back to a plate lower in stack.

One day a man came to the humble house of CPUnit and Stackmem. They welcomed him
and when dinner came he asked them a humble question: "how much is the sum of 
2 and 3". Although CPUnit knew how to calculate the `sum` of something and he could
remember `2` and even `2` his mind wouldn't allow him also to recall the instruction
at the same time. He couldn't recall `sum` so he had no clue what to do.

Stackmem didn't fare any better. Altough she could remember `2` and `3` and even `sum` 
she had no clue to calculate anything with that stuff. The only thing she could answer 
was `sum`, the last thing she remembered.

Sensing that they were a bit stumped the man nudged them: "what if you work  together 
on solving this conundrum?" 

Stumped for a bit CPUnit realized he and Stackmem could solve this. Remembering how her
memory worked he started to speak to her softly but clearly:

	sum
	2
	3
	
As an aside, this is a particular way of encoding operations with arguments. In this
case the operation is `sum` and the arguments are `2` and `3`. It's supposed to return
(calculate) the result of adding the arguments (`2` and `3` so in this case `5`).

As this is a stack the number `2` is actually at the top (`>`) of the stack so we might
picture it better like this:

	sum
	2
	>3
	
So instead of saying `2 + 3` we say `sum 2 3` which is a bit weird but it's called 
*polish notation*. It's like saying `+ 2 3` only instead of having the `+` we'll use
`sum` for now.
  
So CPUnit can only remember **two** things. Let's call these things `lhs` 
(left-hand side) and `rhs` (right-hand side). Now we start asking Stackmem for her
most recent memories:
   
	rhs = Stackmem.lastMemory();
	
We'll ask Stackmem for her last memory, which is the `3` the last thing we told her.
Of course, she'll promptly forget about this memory. It looks like this:

	sum
	>2
	
Now we ask her for her last memory again:	
	
	lhs = Stackmem.lastMemory();
	
And we got the second argument for our operation. CPUnit is now at the limits of his 
memory capacity. He has `2` and `3` but no clue what to do with them. So he asks
Stackmem for her last memory:

	op = Stackmem.lastMemory();
	
Now we got a number which could mean anything but assuming everything went according 
to plan we got a number that tells CPUnit to perform a `sum` operation. So knowing
that CPUnit doesn't have to remember the operation. It knows it needs two things so 
it grabs `2` and `3` from its (limited) memory and performs the `sum` opeatrion and
immediately tells Stackmem the answer. 

Looking amazed and utterly confouned, Stackmem turns to the man and says: `5`.
	
	
	answer = lhs + rhs;
	
   
## Op Codes
NOTE: This should be a sidebar (I think).

Before we even get to do any programming we have to define opcodes. An *opcode* 
is a number that *instructs* our virtual machine what operation to perform. The
action they have on the machine that processes them is called an *instruction*.

Numbers mapping to instructions are an obvious choice. There's only so many
iunstructions we really need and they can usually be mapped to the range of 
0 - 255 pretty easily. Conveniently this fits in a *byte* so that's why the
term *bytecode* is also very prevalent when talking about virtual machines.

## Return
One of the most basic and essential operations is *return*. When you invoke a 
program you expect it to return (or yield back processing resources) back to 
the program (or process) that invoked it. This is often the processing system
at the very beginning but once a program is running it might invoke a whole 
host of other processes and those should, at some point, be returning control.

 

## The Humble NOP
TODO