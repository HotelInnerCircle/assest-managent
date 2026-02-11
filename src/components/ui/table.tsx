import * as React from "react";
import { cn } from "@/lib/utils";

/* ================= MAIN TABLE ================= */

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto rounded-2xl border shadow-sm bg-white dark:bg-gray-900">
    <table
      ref={ref}
      className={cn(
        "w-full caption-bottom text-sm border-collapse",
        className
      )}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

/* ================= HEADER ================= */

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "sticky top-0 z-10 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-b",
      className
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

/* ================= BODY ================= */

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "divide-y divide-gray-100 dark:divide-gray-800",
      className
    )}
    {...props}
  />
));
TableBody.displayName = "TableBody";

/* ================= FOOTER ================= */

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "bg-muted/50 font-medium border-t",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

/* ================= ROW ================= */

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-gray-800 hover:shadow-sm",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

/* ================= HEAD CELL ================= */

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-14 px-6 text-left align-middle font-semibold text-gray-700 dark:text-gray-200 tracking-wide text-xs uppercase",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

/* ================= BODY CELL ================= */
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      `
      px-6 py-4
      align-middle
      text-sm
      font-medium
      text-gray-700 dark:text-gray-300
      transition-colors duration-200
      group-hover:text-gray-900
      dark:group-hover:text-white
      `,
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";


/* ================= CAPTION ================= */

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn(
      "mt-4 text-sm text-muted-foreground",
      className
    )}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
