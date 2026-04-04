import type * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual style variant. Defaults to 'default'. */
  variant?: "default" | "outlined" | "elevated";
  /** Padding size. Defaults to 'md'. */
  padding?: "none" | "sm" | "md" | "lg";
  children?: React.ReactNode;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}
