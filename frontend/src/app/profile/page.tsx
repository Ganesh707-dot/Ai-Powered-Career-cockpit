"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings2 } from "lucide-react";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { useProfileForm } from "@/hooks/use-profile-form";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const router = useRouter();
  const form = useProfileForm();

  const handleSave = () => {
    form.save();
    router.back();
  };

  return (
    <div className="xl:max-w-2xl xl:mx-auto">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur-xl safe-top xl:rounded-t-xl">
        <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9" asChild>
          <Link href="/" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary shrink-0" />
            <h1 className="text-base font-semibold truncate">Profile setup</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Optional — Job Mentor chat builds this from conversation too.
          </p>
        </div>
      </header>

      <ProfileEditor
        {...form}
        onSave={handleSave}
        variant="page"
      />
    </div>
  );
}
