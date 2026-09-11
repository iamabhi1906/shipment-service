import { Column, Entity, OneToMany, PrimaryGeneratedColumn, type Relation } from "typeorm";
import Stop from "./stop.entity.js";
import { uuid } from "uuidv4";
import { DomainEvent } from "./events/domain-event.js";
import { ShipmentStatus } from "./enums/shipment.enums.js";
import ShipmentCreatedEvent from "./events/shipment-created.event.js";
import { StopStatus } from "./enums/stops.enums.js";

@Entity({ schema: "shipment", name: "shipments" })
class Shipment {
	private events: DomainEvent[] = [];

	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "enum", enum: ShipmentStatus, default: ShipmentStatus.IN_TRANSIT })
	private status: ShipmentStatus = ShipmentStatus.IN_TRANSIT;

	@OneToMany(
		() => Stop,
		(stop) => stop.shipment,
		{ cascade: true },
	)
	stops: Relation<Stop[]>;

	constructor(id: string) {
		this.id = id;
	}

	private findStop(stopId: string): Stop {
		const stop = this.stops.find((stop) => stop.getId() === stopId);
		if (!stop) throw new Error("Stop does not exist");
		return stop;
	}

	static create(stops: Stop[]): Shipment {
		if (stops.length === 0) throw new Error("Shipment must contain at least one stop");
		const shipment = new Shipment(uuid());
		shipment.stops = stops;
		shipment.events.push(
			new ShipmentCreatedEvent(
				shipment.id,
				stops.map((stop) => stop.getId()),
			),
		);
		return shipment;
	}

	arriveAtStop(stopId: string): void {
		const stop = this.findStop(stopId);
		const previousStops = this.stops.filter((previousStop) => previousStop.getSequence() < stop.getSequence());
		const allPreviousStopsDeparted = previousStops.every(
			(previousStop) => previousStop.getStatus() === StopStatus.Departed,
		);
		if (!allPreviousStopsDeparted) throw new Error("Prior stops have not departed");
		stop.arrive();
	}

	pickupAtStop(stopId: string): void {
		const stop = this.findStop(stopId);
		stop.pickup();
		this.checkCompletion();
	}

	deliverAtStop(stopId: string): void {
		const stop = this.findStop(stopId);
		stop.deliver();
		this.checkCompletion();
	}

	private checkCompletion(): void {
		const allStopsCompleted = this.stops.every(
			(stop) => stop.getStatus() === StopStatus.Departed || stop.getStatus() === StopStatus.Completed,
		);
		if (allStopsCompleted) this.status = ShipmentStatus.COMPLETED;
	}

	//getters
	getStatus = (): ShipmentStatus => this.status;
	getStops = (): Stop[] => this.stops;
	getId = (): string => this.id;

	pullEvents(): DomainEvent[] {
		const events = [...this.events];
		this.events = [];
		return events;
	}
}

export default Shipment;
