"use client";

import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="outline" size="sm" className="w-full">
        Выйти
      </Button>
    </form>
  );
}
