import { Migration } from '@mikro-orm/migrations';

export class Migration20261017210317 extends Migration {
  override name = 'Migration20261017210317';

  override up(): void | Promise<void> {
    this.addSql(
      `create table "events" ("id" uuid not null, "name" varchar(255) not null, "description" text not null, "year" int null, "month" int not null, "day" int not null, "type" varchar(255) not null, "recurrence" varchar(255) not null, "is_active" boolean not null, primary key ("id"));`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "events" cascade;`);
  }
}
