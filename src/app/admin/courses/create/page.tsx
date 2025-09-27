import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CourseCreateSchema, CourseCreateInput} from "@/lib/zodSchemas";
import { z } from "zod";
export default function CourseCreationPage() {
const form = useForm<CourseCreateInput>({
  resolver: zodResolver(CourseCreateSchema),
  defaultValues: {
    title: "",
    description: "",
    fileKey: "",
    price: "0",          // as string
    duration: "0",       // as string
    level: "BEGINNER",
    category: "",
    smallDescription: "",
    slug: "",
    status: "DRAFT",
  },
});



  return(
    <>
    <div className="flex items-center gap-4">
      <Link href={"/admin/courses"} className={buttonVariants({
        variant: "outline",
        size: "icon",
      })}>
      <IconArrowLeft className="size-4"/>
      </Link>
      <h1 className="text-2xl font-bold">Courses</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Provide basic information about the course</CardDescription>
        </CardHeader>
      </Card>
      </>
  );
}