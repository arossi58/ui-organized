import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination } from "@ui-organized/react";

const meta: Meta<typeof Pagination> = {
  title: "Components/Navigation/Pagination",
  component: Pagination,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Numbered page navigation with previous/next controls. Controlled via `page`, `count`, and `onPageChange`. Collapses long ranges with an ellipsis.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

function PaginationDemo({ count }: { count: number }) {
  const [page, setPage] = useState(1);
  return <Pagination page={page} count={count} onPageChange={setPage} />;
}

export const Inspect: Story = {
  tags: ["dev"],
  render: () => <PaginationDemo count={10} />,
};

export const ManyPages: Story = {
  render: () => <PaginationDemo count={50} />,
};
