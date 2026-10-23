import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiArrowLeft, FiArrowRight, FiCheck } from "react-icons/fi";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, Button } from "@/components/ui";
import { jobsApi } from "@/api/jobsApi";
import {
  postJobSchema,
  postJobStepFields,
  postJobSteps,
  type PostJobFormValues,
} from "@/features/jobs/schemas";
import { StepIndicator } from "@/features/jobs/components/StepIndicator";
import { JobDetailsStep } from "@/features/jobs/components/steps/JobDetailsStep";
import { LocationStep } from "@/features/jobs/components/steps/LocationStep";
import { BudgetStep } from "@/features/jobs/components/steps/BudgetStep";
import { PhotosStep } from "@/features/jobs/components/steps/PhotosStep";
import { ReviewStep } from "@/features/jobs/components/steps/ReviewStep";
import { findCity } from "@/lib/cities";
import styles from "./PostJobPage.module.css";

export function PostJobPage() {
  usePageTitle("Post a job");
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<PostJobFormValues>({
    resolver: zodResolver(postJobSchema),
    defaultValues: {
      title: "",
      trade: "",
      description: "",
      address: "",
      city: "",
      budgetMin: 0,
      budgetMax: 0,
      photos: [],
    },
  });

  const values = watch();
  const isLastStep = step === postJobSteps.length - 1;

  const goNext = async () => {
    const fields = postJobStepFields[step];
    const valid = await trigger(fields);
    if (valid) setStep((s) => Math.min(s + 1, postJobSteps.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (data: PostJobFormValues) => {
    setSubmitError(null);

    // Prefer the device location; otherwise fall back to the city centre.
    const city = findCity(data.city);
    const latitude = data.latitude ?? city?.latitude;
    const longitude = data.longitude ?? city?.longitude;
    if (latitude === undefined || longitude === undefined) {
      setSubmitError("Choose a city or share your location so artisans can find this job.");
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const job = await jobsApi.create({ ...data, latitude, longitude });
      navigate(`/jobs/${job.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Couldn't post your job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <StepIndicator steps={postJobSteps} currentStep={step} />

        <form
          className={styles.form}
          onSubmit={isLastStep ? handleSubmit(onSubmit) : (e) => e.preventDefault()}
        >
          <div className={styles.stepContent}>
            {step === 0 && <JobDetailsStep register={register} errors={errors} />}
            {step === 1 && (
              <LocationStep
                register={register}
                errors={errors}
                setValue={setValue}
                hasCoordinates={values.latitude !== undefined}
              />
            )}
            {step === 2 && <BudgetStep register={register} errors={errors} />}
            {step === 3 && (
              <PhotosStep
                photos={values.photos}
                onChange={(photos) => setValue("photos", photos)}
              />
            )}
            {step === 4 && <ReviewStep values={values} />}
          </div>

          {submitError && (
            <p className={styles.submitError} role="alert">
              {submitError}
            </p>
          )}

          <div className={styles.actions}>
            <Button
              type="button"
              variant="outline"
              leftIcon={<FiArrowLeft />}
              onClick={goBack}
              disabled={step === 0}
            >
              Back
            </Button>

            {isLastStep ? (
              <Button type="submit" leftIcon={<FiCheck />} isLoading={isSubmitting}>
                Post job
              </Button>
            ) : (
              <Button type="button" rightIcon={<FiArrowRight />} onClick={goNext}>
                Next
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
