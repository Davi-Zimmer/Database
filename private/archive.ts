const d = `
    [0-3$10]

`

export const archive = `

!15 0 0 [123$0-3,7-9,12-15]

def person .person

#0 .*person @Joseph / -text "hello, world!"
#1 .data.person / -person *#0
#2 .data.person / -person *#0
#3 .*person @Joseph / -text "hello, world!"

#7 .*person @Joseph / -text "hello, world!"
#8 .data.person / -person *#0
#9 .*person @Joseph / -text "hello, world!"
#12 .data.person / -person *#0

#13 .*person @Joseph / -text "hello, world!"
#14 .data.person / -person *#0
#15 .*person @Joseph / -text "hello, world!"

`