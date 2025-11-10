import cassandra from "cassandra-driver";
const Client = cassandra.Client;
const Mapper = cassandra.mapping.Mapper;

const contactPoint001 = process.env.CASS_CONTACT_POINT_001 || "cassandra";
const dataCenter = process.env.CASS_DATA_CENTER || "datacenter1";
const keyspace = process.env.CASS_KEYSPACE || "event_service";

export const cassandraClient = new Client({
	contactPoints: [contactPoint001],
	localDataCenter: dataCenter,
	keyspace,
});

export const mapper = new Mapper(cassandraClient, {
	models: {
		Venue: { tables: ["venues"] },
		Events: { tables: ["events"] },
		Shows: { tables: ["shows"] },
		SeatAvailability: { tables: ["seat_availability_by_show"] },
		SeatSnapshot: { tables: ["seat_snapshot_by_show"] },
	},
});

export const venueMapper = mapper.forModel("Venue");
export const eventsMapper = mapper.forModel("Events");
export const showsMapper = mapper.forModel("Shows");
export const seatAvailabilityMapper = mapper.forModel("SeatAvailability");
export const seatSnapshotMapper = mapper.forModel("SeatSnapshot");
