"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconArrowLeft, IconCheck, IconX, IconLoader2, IconAlertCircle } from "@tabler/icons-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CourseCreateSchema, CourseCreateInput, sanitizeSlug } from "@/lib/zodSchemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { useTransition, useState, useCallback, useEffect } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { createCourse, checkSlugAvailability, generateUniqueSlug, saveDraft } from "./actions";
import { useRouter } from "next/navigation";
import { PlusIcon, SaveIcon, RefreshCwIcon } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

type SlugStatus = "idle" | "checking" | "available" | "unavailable" | "error";

export default function CourseCreationPage() {
  const [isPending, startTransition] = useTransition();
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastDraftSave, setLastDraftSave] = useState<Date | null>(null);
  const [slugSuggestion, setSlugSuggestion] = useState<string>("");
  
  const router = useRouter();
  
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
    mode: "onChange",
  });

  // Watch for form changes
  const watchedValues = form.watch();
  const currentSlug = form.watch("slug");
  const currentTitle = form.watch("title");
  const debouncedSlug = useDebounce(currentSlug, 800);
  const isFormDirty = form.formState.isDirty;
  const isSubmitting = form.formState.isSubmitting || isPending;
  const formErrors = form.formState.errors;

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(isFormDirty);
  }, [isFormDirty]);

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isSubmitting) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    const handleRouteChange = () => {
      if (hasUnsavedChanges && !isSubmitting) {
        return "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges, isSubmitting]);

  // Real-time slug validation
  useEffect(() => {
    const checkSlug = async () => {
      if (!debouncedSlug || debouncedSlug.length < 3) {
        setSlugStatus("idle");
        setSlugSuggestion("");
        return;
      }

      // Validate slug format
      const sanitized = sanitizeSlug(debouncedSlug);
      if (sanitized !== debouncedSlug) {
        form.setValue("slug", sanitized, { shouldValidate: true });
        return;
      }

      setSlugStatus("checking");
      
      try {
        const { available, suggestion } = await checkSlugAvailability(debouncedSlug);
        setSlugStatus(available ? "available" : "unavailable");
        setSlugSuggestion(suggestion || "");
        
        if (!available && suggestion) {
          toast.info(`Slug "${debouncedSlug}" is taken. Try "${suggestion}"?`, {
            action: {
              label: "Use Suggestion",
              onClick: () => {
                form.setValue("slug", suggestion, { shouldDirty: true, shouldValidate: true });
                setSlugSuggestion("");
              },
            },
            duration: 10000,
          });
        }
      } catch (error) {
        console.error("Slug check failed:", error);
        setSlugStatus("error");
        setSlugSuggestion("");
      }
    };

    checkSlug();
  }, [debouncedSlug, form]);

  // Auto-save draft functionality
  const autoSaveDraft = useCallback(async () => {
    if (!isFormDirty || isSubmitting || isDraftSaving) return;

    const values = form.getValues();
    if (!values.title || values.title.length < 3) return;

    setIsDraftSaving(true);
    
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, typeof value === "number" ? value.toString() : value ?? "");
      });

      const { data, error } = await tryCatch(saveDraft(formData));
      
      if (data?.status === "success") {
        setLastDraftSave(new Date());
        toast.success("Draft saved automatically", { duration: 2000 });
      } else if (data?.status === "error") {
        toast.error(`Auto-save failed: ${data.message}`);
      }
    } catch (error) {
      console.warn("Auto-save failed:", error);
      toast.error("Auto-save failed. Please save manually.");
    } finally {
      setIsDraftSaving(false);
    }
  }, [form, isFormDirty, isSubmitting, isDraftSaving]);

  // Auto-save every 60 seconds
  useEffect(() => {
    const interval = setInterval(autoSaveDraft, 60000);
    return () => clearInterval(interval);
  }, [autoSaveDraft]);

  // Generate slug function
  const generateSlug = useCallback(async () => {
    const title = form.getValues("title");
    if (!title || title.length < 3) {
      toast.error("Please enter a title first (minimum 3 characters)");
      return;
    }

    setIsGeneratingSlug(true);
    try {
      const { slug } = await generateUniqueSlug(title);
      form.setValue("slug", slug, { shouldDirty: true, shouldValidate: true });
      toast.success("Unique slug generated successfully!");
    } catch (error) {
      console.error("Slug generation failed:", error);
      toast.error("Failed to generate slug. Please try entering one manually.");
    } finally {
      setIsGeneratingSlug(false);
    }
  }, [form]);

  // Auto-generate slug when title changes (debounced)
  const debouncedTitle = useDebounce(currentTitle, 1000);
  useEffect(() => {
    if (debouncedTitle && !currentSlug && debouncedTitle.length >= 3) {
      generateSlug();
    }
  }, [debouncedTitle, currentSlug, generateSlug]);

  // Manual save draft
  const handleSaveDraft = useCallback(async () => {
    await autoSaveDraft();
  }, [autoSaveDraft]);

  // Submit handler
  const onSubmit = async (values: CourseCreateInput) => {
    try {
      // Pre-submission validation
      if (!values.fileKey) {
        toast.error("Please upload a course thumbnail");
        form.setError("fileKey", { message: "Course thumbnail is required" });
        document.querySelector('[name="fileKey"]')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      if (slugStatus === "unavailable") {
        toast.error("Please choose a different URL slug - this one is already taken");
        form.setError("slug", { message: "This slug is already taken" });
        document.querySelector('[name="slug"]')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      if (slugStatus === "checking") {
        toast.error("Please wait for slug validation to complete");
        return;
      }

      // Show loading state
      const loadingToast = toast.loading("Creating your course...", {
        description: "This may take a few moments",
      });

      startTransition(async () => {
        try {
          // Convert values to FormData
          const formData = new FormData();
          Object.entries(values).forEach(([key, value]) => {
            formData.append(key, typeof value === "number" ? value.toString() : value ?? "");
          });

          const { data, error } = await tryCatch(createCourse(formData));

          toast.dismiss(loadingToast);

          if (error) {
            console.error("Network error:", error);
            toast.error("Network error occurred. Please check your connection and try again.", {
              description: "If the problem persists, please contact support.",
            });
            return;
          }

          if (data?.status === "success") {
            toast.success("Course created successfully!", {
              description: `"${values.title}" is now available in your courses.`,
            });
            
            // Clear any saved drafts
            setLastDraftSave(null);
            setHasUnsavedChanges(false);
            
            // Reset form
            form.reset();
            
            // Redirect with course data
            if (data.data?.id) {
              router.push(`/admin/courses/${data.data.id}/edit`);
            } else {
              router.push("/admin/courses");
            }
          } else if (data?.status === "error") {
            toast.error("Failed to create course", {
              description: data.message,
            });
            
            // Handle specific error cases
            if (data.message.includes("slug")) {
              form.setError("slug", { message: "This URL slug is already taken" });
            } else if (data.message.includes("title")) {
              form.setError("title", { message: "This title is already used" });
            }
          }
        } catch (error) {
          toast.dismiss(loadingToast);
          console.error("Unexpected error:", error);
          toast.error("An unexpected error occurred", {
            description: "Please try again or contact support if the issue persists.",
          });
        }
      });
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Form validation failed. Please check your inputs and try again.");
    }
  };

  // Handle navigation with unsaved changes
  const handleExit = () => {
    if (hasUnsavedChanges) {
      setShowExitDialog(true);
    } else {
      router.push("/admin/courses");
    }
  };

  const confirmExit = () => {
    setHasUnsavedChanges(false);
    router.push("/admin/courses");
  };

  // Get slug status icon and color
  const getSlugStatusDisplay = () => {
    switch (slugStatus) {
      case "checking":
        return { icon: IconLoader2, className: "w-4 h-4 animate-spin text-blue-400" };
      case "available":
        return { icon: IconCheck, className: "w-4 h-4 text-green-400" };
      case "unavailable":
        return { icon: IconX, className: "w-4 h-4 text-red-400" };
      case "error":
        return { icon: IconAlertCircle, className: "w-4 h-4 text-orange-400" };
      default:
        return null;
    }
  };

  const slugStatusDisplay = getSlugStatusDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleExit}
              variant="glass"
              size="icon"
              className="shadow-lg hover:shadow-xl transition-all duration-300 border-white/20 hover:border-emerald-400/50"
            >
              <IconArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Create New Course
              </h1>
              <p className="text-slate-300 mt-1">Set up your course with all the necessary information</p>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="border-orange-400 text-orange-400 bg-orange-400/10">
                <div className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse" />
                Unsaved Changes
              </Badge>
            )}
            
            {lastDraftSave && (
              <Badge variant="outline" className="border-green-400 text-green-400 bg-green-400/10">
                <IconCheck className="w-3 h-3 mr-1" />
                Draft Saved {lastDraftSave.toLocaleTimeString()}
              </Badge>
            )}
            
            <Button
              type="button"
              variant="glass"
              size="sm"
              onClick={handleSaveDraft}
              disabled={!hasUnsavedChanges || isSubmitting || isDraftSaving}
              className="border-cyan-400/50 text-cyan-300 hover:text-cyan-200"
            >
              {isDraftSaving ? (
                <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <SaveIcon className="w-4 h-4 mr-2" />
              )}
              Save Draft
            </Button>
          </div>
        </div>

        {/* Form Cards */}
        <div className="grid gap-8 w-full">
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
                        <FormDescription className="text-slate-400">
                          Choose a clear, descriptive title that tells students what they'll learn
                        </FormDescription>
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
                            <div className="flex-1 relative">
                              <Input 
                                placeholder="react-development-bootcamp" 
                                className="h-12 text-base bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 backdrop-blur-sm transition-all duration-300 pr-10"
                                {...field} 
                              />
                              {/* Slug status indicator */}
                              {slugStatusDisplay && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  <slugStatusDisplay.icon className={slugStatusDisplay.className} />
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <Button
                            type="button"
                            variant="ocean"
                            onClick={generateSlug}
                            disabled={isGeneratingSlug || !currentTitle || currentTitle.length < 3}
                            className="h-12 px-6 whitespace-nowrap shadow-lg hover:shadow-xl"
                          >
                            {isGeneratingSlug ? (
                              <IconLoader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Generate"
                            )}
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <FormDescription className="text-slate-400">
                            Course URL: <span className="text-emerald-400">ethed.com/courses/{field.value || "your-slug"}</span>
                          </FormDescription>
                          {slugStatus === "unavailable" && (
                            <p className="text-sm text-red-400 flex items-center gap-1">
                              <IconX className="w-3 h-3" />
                              This URL is already taken
                            </p>
                          )}
                          {slugStatus === "available" && field.value && (
                            <p className="text-sm text-green-400 flex items-center gap-1">
                              <IconCheck className="w-3 h-3" />
                              This URL is available
                            </p>
                          )}
                        </div>
                        
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator className="bg-slate-600/50" />

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
                        <FormDescription className="text-slate-400">
                          Help students find your course by choosing the most relevant category
                        </FormDescription>
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
                                <SelectItem value="BEGINNER" className="text-white hover:bg-slate-700/50 focus:bg-slate-700/50">
                                  🟢 Beginner - No prior experience needed
                                </SelectItem>
                                <SelectItem value="INTERMEDIATE" className="text-white hover:bg-slate-700/50 focus:bg-slate-700/50">
                                  🟡 Intermediate - Some basic knowledge required
                                </SelectItem>
                                <SelectItem value="ADVANCED" className="text-white hover:bg-slate-700/50 focus:bg-slate-700/50">
                                  🔴 Advanced - Extensive experience required
                                </SelectItem>
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
                                <SelectItem value="DRAFT" className="text-white hover:bg-slate-700/50 focus:bg-slate-700/50">
                                  📝 Draft - Not visible to students
                                </SelectItem>
                                <SelectItem value="PUBLISHED" className="text-white hover:bg-slate-700/50 focus:bg-slate-700/50">
                                  ✅ Published - Live and visible to students
                                </SelectItem>
                                <SelectItem value="ARCHIVED" className="text-white hover:bg-slate-700/50 focus:bg-slate-700/50">
                                  📦 Archived - Hidden but accessible via direct link
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator className="bg-slate-600/50" />

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
                                min="0"
                                max="9999"
                                step="0.01"
                                placeholder="99.00"
                                className="h-12 text-base pl-8 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 backdrop-blur-sm transition-all duration-300"
                                {...field}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  field.onChange(Math.min(Math.max(value, 0), 9999));
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="text-slate-400">
                            Set to $0 for free courses. Maximum price is $9,999
                          </FormDescription>
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
                                min="0.5"
                                max="500"
                                step="0.5"
                                placeholder="10"
                                className="h-12 text-base bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 backdrop-blur-sm transition-all duration-300"
                                {...field}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  field.onChange(Math.min(Math.max(value, 0.5), 500));
                                }}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 text-base font-semibold">hrs</span>
                            </div>
                          </FormControl>
                          <FormDescription className="text-slate-400">
                            Estimated completion time including all materials (0.5-500 hours)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator className="bg-slate-600/50" />

                  {/* Course Thumbnail */}
                  <FormField
                    control={form.control}
                    name="fileKey"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-medium text-white">
                          Course Thumbnail *
                        </FormLabel>
                        <FormControl>
                          <div className="rounded-lg border-2 border-dashed border-slate-600/50 p-1 bg-slate-700/20 backdrop-blur-sm">
                            <Uploader 
                              maxFiles={1}
                              maxSize={5}
                              acceptedFileTypes={{
                                "image/*": [".png", ".jpg", ".jpeg", ".webp"]
                              }}
                              onUploadComplete={(files) => {
                                console.log("🎯 Upload complete callback:", files); // Debug log
                                if (files.length > 0 && files[0].uploadedUrl) {
                                  console.log("🎯 Setting field value:", files[0].uploadedUrl); // Debug log
                                  field.onChange(files[0].uploadedUrl);
                                  // Force form validation update
                                  form.trigger("fileKey");
                                  toast.success("Thumbnail uploaded successfully!");
                                }
                              }}
                              onChange={(urls) => {
                                console.log("🔄 onChange callback:", urls); // Debug log
                                const url = urls[0] || "";
                                field.onChange(url);
                                if (url) {
                                  // Clear any existing error for this field
                                  form.clearErrors("fileKey");
                                  // Trigger validation to update the form state
                                  form.trigger("fileKey");
                                }
                              }}
                              value={field.value ? [field.value] : []}
                              name="courseImage"
                              uploadEndpoint="/api/files"
                              className="bg-slate-700/30 border-slate-600/50"
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-slate-400">
                          Upload a high-quality image (1280x720 recommended). This will be the main visual for your course. Max file size: 5MB.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator className="bg-slate-600/50" />

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
                            maxLength={200}
                            {...field}
                          />
                        </FormControl>
                        <div className="flex justify-between text-sm text-slate-400">
                          <FormDescription>
                            This appears in course previews and search results
                          </FormDescription>
                          <span className={`font-medium ${(field.value?.length || 0) > 180 ? 'text-orange-400' : 'text-cyan-400'}`}>
                            {field.value?.length || 0}/200
                          </span>
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
                            <RichTextEditor 
                              {...field} 
                              onBlur={() => {
                                field.onBlur();
                                // Trigger auto-save when user stops editing
                                setTimeout(autoSaveDraft, 1000);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-slate-400">
                          Provide a comprehensive description with course objectives, prerequisites, and what students will learn. Use formatting to make it easy to read. (50-5000 characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-slate-600/50">
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="glass"
                        size="lg"
                        onClick={() => {
                          form.reset();
                          setHasUnsavedChanges(false);
                          setLastDraftSave(null);
                          toast.info("Form has been reset");
                        }}
                        className="border-white/20 hover:border-slate-400/50"
                        disabled={isSubmitting}
                      >
                        <RefreshCwIcon className="w-4 h-4 mr-2" />
                        Reset Form
                      </Button>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handleSaveDraft}
                        disabled={!hasUnsavedChanges || isSubmitting || isDraftSaving}
                        className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 bg-slate-800/50"
                      >
                        {isDraftSaving ? (
                          <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <SaveIcon className="w-4 h-4 mr-2" />
                        )}
                        Save Draft
                      </Button>
                      
                      <Button 
                        type="submit" 
                        variant="ocean"
                        size="lg"
                        className="shadow-lg hover:shadow-xl shadow-cyan-500/25 min-w-[160px]"
                        disabled={
                          isSubmitting || 
                          !isFormDirty || 
                          slugStatus === "unavailable" || 
                          slugStatus === "checking" ||
                          Object.keys(formErrors).length > 0
                        }
                      >
                        {isSubmitting ? (
                          <>
                            <IconLoader2 className="w-4 h-4 animate-spin mr-2" />
                            Creating Course...
                          </>
                        ) : (
                          <>
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Create Course
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Exit Confirmation Dialog */}
        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <AlertDialogContent className="bg-slate-800/95 border-slate-600 backdrop-blur-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2">
                <IconAlertCircle className="w-5 h-5 text-orange-400" />
                Unsaved Changes Detected
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                You have unsaved changes that will be lost if you leave this page. Your progress will not be saved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                Stay and Continue Editing
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmExit}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Leave Without Saving
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
