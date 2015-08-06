# Behavior Design

A 'behavior' in RFI:Precursors is a class that listens for events from a given 'controller' and responds to those events.
Typically, we (incorrectly in the strictest sense) refer to behavior instances as 'entities'. Really, the entity is the
entry in RethinkDB, while what we pass around as the entity is a behavior instance.

## Inheritance

We utilize inheritance to construct complex entity behaviors. Our behavior inheritance tree is kept very simple:

```
Entity --> Physical --> Actor --> Ship
   \           \           \
     --> Proxy   --> ???     --> Station?
```

The main classes are:

* `Entity`: This is the base class for all entities. It handles the boiler plate.
* `Physical`: This is the base class for everything that needs to have physics applied to it. (Most, but not all things)
* `Actor`: These are entities that we can interact with, apply damage to, target, etc.
* `Proxy`: This is a special behavior that emulates the functions of any other behavior, but instead represents a 
remotely managed entity.

Then, we have the 'complete' classes, like `Ship`, `Station`, etc. These are classes that we expect to be making 
instances of.

## Controllers

A 'controller' is an `EventEmitter` that provides input events. These are going to be high-level commands, like 
"throttle to 50%". These inputs are assumed to come from either humans or AI.

## Proxies

Because we're dealing with a distributed system, any two entities may not be local to each other. When one entity needs
to work with another, it will request that entity from the `EntityManager`. The manager then creates a Proxy object for 
the entity (which queries from the DB, and gets notified of changes). All functions on that proxy actually go through a
Pub/Sub system to the 'canonical' behavior instance. If any messages need to be sent back to the first entity, the 
second entity simply uses the same system, only in reverse:w
.