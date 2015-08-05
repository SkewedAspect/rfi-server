# Behavior Design

A 'behavior' in RFI:Precursors is a class that listens for events from a given 'controller' and responds to those events.
Typically, we (incorrectly in the strictest sense) refer to behavior instances as 'entities'. Really, the entity is the
entry in RethinkDB, while what we pass around as the entity is a behavior instance.

## Inheritance

We utilize inheritance to construct complex entity behaviors. Our behavior inheritance tree is kept very simple:

```
Entity --> Physical --> Actor --> Ship
              \           \
                --> ???     --> Station?
```

The main classes are:

* `Entity`: This is the base class for all entities. It handles the boiler plate.
* `Physical`: This is the base class for everything that needs to have physics applied to it. (Most, but not all things)
* `Actor`: These are entities that we can interact with, apply damage to, target, etc.

Then, we have the 'complete' classes, like `Ship`, `Station`, etc. These are classes that we expect to be making 
instances of.