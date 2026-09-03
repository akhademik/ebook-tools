add new syntax code for me, when the parse read the .txt if it found

!D This is the text

then it will know to ignore adding dropcap to the "T"

so if normally i have

@@ chapter1
or
@ chapter 1

This => This 'T' will be dropcap

but if i have

@@ chapter1
or
@ chapter 1

!D This => This 'T' will not be dropcap, it will be just a normal paragraph,

the !D must be in start of a paragraph, follow it will be a space, it could never be in the middle of the paragraph
