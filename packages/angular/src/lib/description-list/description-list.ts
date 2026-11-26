import { Component, booleanAttribute, computed, input } from "@angular/core";
import { descriptionListStyles } from "@ui-organized/core";

/** One term and its details, for the `items` shorthand. */
export interface DescriptionListEntry {
  term: string;
  details: string;
}

/**
 * One term and its details; the content is the details.
 *
 * ```html
 * <div uioDescriptionListItem term="Status"><span uioTag variant="success">Active</span></div>
 * ```
 */
@Component({
  selector: "div[uioDescriptionListItem]",
  standalone: true,
  template: `<dt class="description-list__term">{{ term() }}</dt>
    <dd class="description-list__details"><ng-content /></dd>`,
  host: { class: "description-list__item" },
})
export class UioDescriptionListItem {
  /** What the details describe: "Plan", "Renews". */
  readonly term = input.required<string>();
}

/**
 * Terms and their details, such as a record's fields.
 *
 * ```html
 * <dl uioDescriptionList [items]="[{ term: 'Plan', details: 'Pro' }]"></dl>
 * ```
 *
 * `items` renders before any projected `div[uioDescriptionListItem]`s.
 */
@Component({
  selector: "dl[uioDescriptionList]",
  standalone: true,
  template: `@for (item of items(); track $index) {
      <div class="description-list__item">
        <dt class="description-list__term">{{ item.term }}</dt>
        <dd class="description-list__details">{{ item.details }}</dd>
      </div>
    }
    <ng-content />`,
  host: { "[class]": "hostClass()" },
})
export class UioDescriptionList {
  readonly items = input<readonly DescriptionListEntry[]>([]);
  readonly layout = input<"inline" | "stacked">("inline");
  readonly size = input<"sm" | "md">("md");
  readonly divided = input(false, { transform: booleanAttribute });
  protected readonly hostClass = computed(() =>
    descriptionListStyles({ layout: this.layout(), size: this.size(), divided: this.divided() }),
  );
}
