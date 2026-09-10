import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { StopStatus, StopType } from "../../enums/stops.enums.js";
import Shipment from "./shipment.entity.js";

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
		if (this.status !== StopStatus.InTransit) throw new Error("Stop has already arrived or departed");
		this.status = StopStatus.Arrived;
	}

	pickup() {
		if (this.type !== StopType.Pickup) throw new Error("Cannot pickup a stop that is not a pickup");
		if (this.status !== StopStatus.Arrived) throw new Error("Cannot pickup a stop that has not arrived");
		this.status = StopStatus.Departed;
	}

	deliver() {
		if (this.type !== StopType.Delivery) throw new Error("Cannot deliver a stop that is not a delivery");
		if (this.status !== StopStatus.Arrived) throw new Error("Cannot deliver a stop that has not arrived");
		this.status = StopStatus.Completed;
	}

	// Getters
	getStatus = (): StopStatus => this.status;
	getId = (): string => this.id;
	getSequence = (): number => this.sequence;
	getType = (): StopType => this.type;
}

export default Stop;
