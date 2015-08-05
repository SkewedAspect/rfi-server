# RethinkDB Changefeed Work

These changes are deceptively simple, but far reaching. In theory, all we need to do is to listen for changes from the
database, and send updates based on that. However, there's a not insignificant retooling of the database and model
system, as well as how we handle entities. This is an attempt to keep all the moving bits straight.

## Data Structure Changes

We need a core entity model, as opposed to several. This means we probably need to rework the entire template system.

### Entity
 - `id`: String
 - `type`: Virtual -> template.type
 - `behavior`: String
 - `ownerID`: String
 - `entityManagerID`: String
 - `state`: Object
 - `templateName`: String

### Template
 - `name`: String
 - `type`: String
 - `behavior`: String
 - `baseState`: Object

 `Entities` in this design are very basic objects, with a `state` property, which will mostly be managed by the behavior.
 They have a many to one relationship with `Templates`, which have a `baseState` property that provides default values for
 everything.

 Here's some examples of how this might work. Let's assume we have an Ares ship template:

 ```javascript
 {
   name: "ares",
   type: "player ship",
   behavior: "ship",
   baseState: { ... }
 }
 ```

 Now, we could make a normal entity instance of this:

 ```javascript
 {
   id: "...",
   ownerID: "...",
   entityManagerID: "...",
   state: { ... },
   templateName: "ares"
 }
 ```

 This is pretty standard, and works about how you expect. But, what if we want one of these ships to be scenery in a
 junkyard? It needs to be able to load the correct model, but doesn't take damage or move. You could make one like this:

 ```javascript
 {
   id: "...",
   behavior: "scenery",
   ownerID: "...",
   entityManagerID: "...",
   state: { ... },
   templateName: "ares"
 }
 ```
 What's neat about this, is it allows us to swap out the behavior, if we want, simply by chancing that one field. If we
 want the ship to suddenly come to life because of a scripted event, we totally can.
