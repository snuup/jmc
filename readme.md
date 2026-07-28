embrace typescript
embrace jsx / tsx
simplicity to a level where everybody can read, fix, expand the code

1. model
- is a pojo
    no magic as in vue or svelte
    no insane functional optics and lenses, no toolkits, needed to change a property value in the state
    no proxificiation of the pojo, just the instance must remain stable

2. controller
- only controller can modify the model, which is immutable for other code like the view
- controller actions modify the model and update the relevant parts of the view.
    while this causes minimal effort to the programmer it has these advantages:
    no magic as in vue or svelte
    no inefficient comparisons between old and new state as in react-redux glue code
    affected parts of the view are updated once - with automagic, "reactive" frameworks, updates might occur more than once

3. view
- is the dom, described as statically typed jsx, namely tsx
    typescript compiler team went to incredible heights making jsx perfectly safe.
    writing the view is to a good part similar as in react, having invented jsx from hyperscript is the good part of react
- updates of the the view can be as fine granular as desired, their scope is specified by a dom element
- while jsx expression are traditionally transformed into virtual dom representations that are then syncd with the real dome,
    jmx avoids the cost of a virtual dom. instead, jsx expressions are transformed into update functions that take the real dom
    element as argument and sync that element when called.

since the model is just a pojo and the controller a plane class with methods for the applications operations, the only missing piece is the specific jsx view.
the jmx library therefore provides:
    a vite plugin that transforms the js code for jsx fragments a little bit
    a real dom update system that has similarities with v-dom libraries, and equals their rather low complexity

in addition to that library, jmx provides a style guide on how to write js applications (a strict layer pattern), how to debug them and finally a simple router.
