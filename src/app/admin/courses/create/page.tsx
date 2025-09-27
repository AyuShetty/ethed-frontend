"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CourseCreateSchema, CourseCreateInput } from "@/lib/zodSchemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import Uploader from "@/components/file-uploader/Uploader";

export default function CourseCreationPage() {
  const form = useForm<CourseCreateInput>({
    resolver: zodResolver(CourseCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      fileKey: "",
      price: 0,
      duration: 0,
      level: "BEGINNER",
      category: "",
      smallDescription: "",
      slug: "",
      status: "DRAFT",
    },
  });

  function generateSlug() {
    const title = form.getValues("title");
    if (!title) {
      toast.error("Please enter a title first");
      return;
    }

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with hyphen
      .replace(/^-+|-+$/g, ""); // Trim hyphens

    form.setValue("slug", slug);
    toast.success("Slug generated successfully!");
  }

  function onSubmit(values: CourseCreateInput) {
    console.log(values);
    toast.success("Course created successfully!");
  }

  return (
    <div className="min-h-screen">
      <div className="w-full p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={"/admin/courses"}
            className={buttonVariants({
              variant: "glass",
              size: "icon",
              className: "shadow-lg hover:shadow-xl transition-all duration-300 border-white/20 hover:border-emerald-400/50"
            })}
          >
            <IconArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Create New Course
            </h1>
            <p className="text-slate-300 mt-1">Set up your course with all the necessary information</p>
          </div>
        </div>

        {/* Form Cards */}
        <div className="grid gap-8 w-full">
          {/* Basic Information Card */}
          <Card className="shadow-2xl bg-slate-800/40 backdrop-blur-xl border border-white/10">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-cyan-500 rounded-full shadow-lg shadow-emerald-500/30"></div>
                Course Information
              </CardTitle>
              <CardDescription className="text-slate-300">
                Basic details about your course that students will see
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  
                  {/* Course Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-medium text-white">
                          Course Title *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Complete React Development Bootcamp" 
                            className="h-12 text-base bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 backdrop-blur-sm transition-all duration-300"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Slug */}
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-medium text-white">
                          URL Slug *
                        </FormLabel>
                        <div className="flex gap-3">
                          <FormControl>
                            <div className="flex-1">
                              <Input 
                                placeholder="react-development-bootcamp" 
                                className="h-12 text-base bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 backdrop-blur-sm transition-all duration-300"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <Button
                            type="button"
                            variant="ocean"
                            onClick={generateSlug}
                            className="h-12 px-6 whitespace-nowrap shadow-lg hover:shadow-xl"
                          >
                            Generate
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-medium text-white">
                          Category *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Web Development, Data Science, Design" 
                            className="h-12 text-base bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 backdrop-blur-sm transition-all duration-300"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Level and Status Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-base font-medium text-white">
                            Difficulty Level *
                          </FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="h-12 text-base bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 backdrop-blur-sm transition-all duration-300">
                                <SelectValue placeholder="Select difficulty level" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800/95 border-slate-600 backdrop-blur-xl">
                                <SelectItem value="BEGINNER" className="text-white hover:bg-slate-700/50 focus:bg-slate-700/50">🟢 Beginner</SelectItem>
                                <SelectItem value="INTERMEDIATE" className="text-white hover:bg-slate-700/50 focus:bg-slate-700/50">🟡 Intermediate</SelectItem>
                                <SelectItem value="ADVANCED" className="text-white hover:bg-slate-700/50 focus:bg-slate-700/50">🔴 Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-base font-medium text-white">
                            Publication Status *
                          </FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="h-12 text-base bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 backdrop-blur-sm transition-all duration-300">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800/95 border-slate-600 backdrop-blur-xl">
                                <SelectItem value="DRAFT" className="text-white hover:bg-slate-700/50 focus:bg-slate-700/50">📝 Draft</SelectItem>
                                <SelectItem value="PUBLISHED" className="text-white hover:bg-slate-700/50 focus:bg-slate-700/50">✅ Published</SelectItem>
                                <SelectItem value="ARCHIVED" className="text-white hover:bg-slate-700/50 focus:bg-slate-700/50">📦 Archived</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Price and Duration Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-base font-medium text-white">
                            Price (USD) *
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 text-base font-semibold">$</span>
                              <Input
                                type="number"
                                placeholder="99.00"
                                className="h-12 text-base pl-8 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 backdrop-blur-sm transition-all duration-300"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-base font-medium text-white">
                            Duration (Hours) *
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                placeholder="10"
                                className="h-12 text-base bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 backdrop-blur-sm transition-all duration-300"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 text-base font-semibold">hrs</span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Course Thumbnail */}
                  <div className="space-y-3">
                    <label className="text-base font-medium text-white">
                      Course Thumbnail *
                    </label>
                    <div className="rounded-lg border-2 border-dashed border-slate-600/50 p-1 bg-slate-700/20 backdrop-blur-sm">
                      <Uploader 
                        maxFiles={1}
                        maxSize={5}
                        acceptedFileTypes={{
                          "image/*": [".png", ".jpg", ".jpeg", ".webp"]
                        }}
                        onUploadComplete={(files) => {
                          if (files.length > 0) {
                            form.setValue("fileKey", files[0].id);
                          }
                        }}
                        className="bg-slate-700/30 border-slate-600/50"
                      />
                    </div>
                  </div>

                  {/* Small Description */}
                  <FormField
                    control={form.control}
                    name="smallDescription"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-medium text-white">
                          Short Description *
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="A compelling short description that appears in course cards and search results..."
                            className="min-h-[100px] text-base bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 backdrop-blur-sm transition-all duration-300 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <div className="flex justify-between text-sm text-slate-400">
                          <span>This will appear in course previews</span>
                          <span className="text-cyan-400">{field.value?.length || 0}/200</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Full Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-medium text-white">
                          Detailed Description *
                        </FormLabel>
                        <FormControl>
                          <div className="border border-slate-600 rounded-lg overflow-hidden bg-slate-700/30 backdrop-blur-sm focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400/20 transition-all duration-300">
                            <RichTextEditor {...field} />
                          </div>
                        </FormControl>
                        <div className="text-sm text-slate-400">
                          Provide a comprehensive description with course objectives, prerequisites, and what students will learn
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-slate-600/50">
                    <Button
                      type="button"
                      variant="glass"
                      size="lg"
                      onClick={() => form.reset()}
                      className="order-2 sm:order-1 border-white/20 hover:border-slate-400/50"
                    >
                      Reset Form
                    </Button>
                    <Button 
                      type="submit" 
                      variant="ocean"
                      size="lg"
                      className="order-1 sm:order-2 shadow-lg hover:shadow-xl shadow-cyan-500/25"
                    >
                      Create Course
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
