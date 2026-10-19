import { Migration } from '@mikro-orm/migrations';

export class Migration20261019150356 extends Migration {
  override name = 'Migration20261019150356';

  override up(): void | Promise<void> {
    this.addSql(
      `create table "event_reminders" ("id" uuid not null, "event_id" uuid not null, "occurrence_date" date not null, "days_before" int not null, "sent_at" timestamptz not null, primary key ("id"));`,
    );
    this.addSql(
      `alter table "event_reminders" add constraint "event_reminders_event_id_occurrence_date_days_before_unique" unique ("event_id", "occurrence_date", "days_before");`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "event_reminders" cascade;`);
  }
}
