import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import Shipment from "./shipment.entity.js";
import { StopStatus, StopType } from "./enums/stops.enums.js";
import { StopAlreadyArrivedOrDepartedException } from "./exceptions/stop-already-arrived-or-departed-exception.js";
import { CannotPickupNonPickupStopException } from "./exceptions/cannot-pickup-non-pickup-stop.exception.js";
import { CannotDeliverNonDeliveryStopException } from "./exceptions/cannot-deliver-non-delivery-stop.exception.js";
import { StopNotArrivedException } from "./exceptions/stop-not-arrived.exception.js";

@Entity({ schema: "shipment", name: "stops" })
class Stop {
	@PrimaryGeneratedColumn("uuid")
	private id: string;

	@Column({ type: "integer" })
	private sequence: number;

	@Column({ type: "enum", enum: StopType })
	private type: StopType;

	@Column({ type: "enum", enum: StopStatus, default: StopStatus.InTransit })
	private status: StopStatus = StopStatus.InTransit;

	@ManyToOne(
		() => Shipment,
		(shipment) => shipment.stops,
	)
	@JoinColumn({ name: "shipment_id" })
	shipment: Relation<Shipment>;

	constructor(id: string, sequence: number, type: StopType) {
		this.id = id;
		this.sequence = sequence;
		this.type = type;
		this.status = StopStatus.InTransit;
	}

	static create(id: string, sequence: number, type: StopType): Stop {
		return new Stop(id, sequence, type);
	}

	arrive() {
		if (this.status !== StopStatus.InTransit) throw new StopAlreadyArrivedOrDepartedException();
		this.status = StopStatus.Arrived;
	}

	pickup() {
		if (this.type !== StopType.Pickup) throw new CannotPickupNonPickupStopException();
		if (this.status !== StopStatus.Arrived) throw new StopNotArrivedException();
		this.status = StopStatus.Departed;
	}

	deliver() {
		if (this.type !== StopType.Delivery) throw new CannotDeliverNonDeliveryStopException();
		if (this.status !== StopStatus.Arrived) throw new StopNotArrivedException();
		this.status = StopStatus.Departed;
	}

	// Getters
	getStatus = (): StopStatus => this.status;
	getId = (): string => this.id;
	getSequence = (): number => this.sequence;
	getType = (): StopType => this.type;
}

export default Stop;
