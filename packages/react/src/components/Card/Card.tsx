import { clsx } from "clsx";
import { cardStyles } from "./Card.styles.js";
import type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps } from "./Card.types.js";
import "./Card.css";

export function Card({ variant, padding, className, children, ...props }: CardProps) {
  return (
    <div className={clsx(cardStyles({ variant, padding }), className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={clsx("card__header", className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }: CardBodyProps) {
  return (
    <div className={clsx("card__body", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={clsx("card__footer", className)} {...props}>
      {children}
    </div>
  );
}
