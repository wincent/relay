# Scope

The purpose of this experiment is to explore some ideas for reducing the size of
query result payloads in Relay and GraphQL, which are currently serialized as
JSON for delivery over the wire.

## Possibilities

- Use of a less redundant format for encoding potentially repetitive tree-shaped
  data; for example [JSON Graph][] or something like it.
- Given such a format as an object, encoding it in a binary format such as
  [MessagePack][] or [FlatBuffers][] in order to get a denser format for
  transmission over the wire.
- Consider teaching the server the semantics of the `RelayRecordStore`, so that
  instead of encoding a tree of data, the server could send a result set across
  the wire as a series of operations necessary to update a flattened store
  (NOTE: `RelayRecordStore` already is a normalized, flattened store).
- Instead of vending materialized objects to views, make client-side proxying
  readers that could produce data on-demand from one of these dense
  representations (such as FlatBuffers) which could be stored as-is inside the
  store.
- Make a transform that would enable component-authors to continue to read data
  using simple property access (eg. `this.props.viewer.notifications.count`,
  which would transpile to `this.props.viewer().notifications().count()` or any
  of a number of other possible variants).
- Indicate the presence of subfields using bit arrays rather than textual field
  names.

## On the use of gzip

I've got tests in here that measure the effect of gzipping the payload. This is
to give us a sense of relative size, and some notion of time cost, but bear in
mind that all data coming from the server gets gzipped anyway transparently, so
it's not something that we'd have to explicitly do.

[FlatBuffers]: https://google.github.io/flatbuffers/
[JSON Graph]: https://netflix.github.io/falcor/documentation/jsongraph.html
[MessagePack]: http://msgpack.org/index.html
