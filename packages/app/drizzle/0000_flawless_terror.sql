CREATE TABLE `message` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer NOT NULL,
	`direction` integer NOT NULL,
	`type` integer NOT NULL,
	`peerUin` integer NOT NULL,
	`sequence` integer NOT NULL,
	`clientSequence` integer,
	`body` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `message_type_peerUin_sequence_unique` ON `message` (`type`,`peerUin`,`sequence`);