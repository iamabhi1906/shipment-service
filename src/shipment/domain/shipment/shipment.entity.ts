import { Column, Entity, OneToMany, PrimaryGeneratedColumn, type Relation } from "typeorm";
import Stop from "./stop.entity.js";
import { uuid } from "uuidv4";
import { ShipmentStatus } from "./enums/shipment.enums.js";
import { StopStatus } from "./enums/stops.enums.js";
import { PreviousStopsNotDepartedException } from "./exceptions/previous-stops-not-departed.exception.js";
import { ShipmentMustHaveAtLeastOneStopException } from "./exceptions/invalid-delivery-stop.exception.js";
import { StopNotFoundException } from "./exceptions/stop-not-found.exception.js";

@Entity({ schema: "shipment", name: "shipments" })
class Shipment {
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
		if (!stop) throw new StopNotFoundException();
		return stop;
	}

	static create(stops: Stop[]): Shipment {
		if (stops.length === 0) throw new ShipmentMustHaveAtLeastOneStopException();
		const shipment = new Shipment(uuid());
		shipment.stops = stops;
		return shipment;
	}

	arriveAtStop(stopId: string): void {
		const stop = this.findStop(stopId);
		const previousStops = this.stops.filter((previousStop) => previousStop.getSequence() < stop.getSequence());
		const allPreviousStopsDeparted = previousStops.every(
			(previousStop) => previousStop.getStatus() === StopStatus.Departed,
		);
		if (!allPreviousStopsDeparted) throw new PreviousStopsNotDepartedException();
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
		const allStopsCompleted = this.stops.every((stop) => stop.getStatus() === StopStatus.Departed);
		if (allStopsCompleted) this.status = ShipmentStatus.COMPLETED;
	}

	// Getters
	getStatus = (): ShipmentStatus => this.status;
	getStops = (): Stop[] => this.stops;
	getId = (): string => this.id;
}

export default Shipment;
