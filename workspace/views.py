from django.contrib.auth.decorators import login_required
from django.utils import timezone

from progress.models import UserCourseProgress, UserLessonProgress, UserVideoProgress, UserTestProgress, \
    UserTaskProgress
from workspace.models import Category, Lesson, Video, Test, Task, TestOption
from django.shortcuts import render, get_object_or_404, redirect
from workspace.models import Course


# Home page
@login_required(login_url='/accounts/login/')
def home_view(request):
    user = request.user
    user_courses = Course.objects.filter(lessons__userlessonprogress__user=user).distinct()

    courses_with_progress = []
    for course in user_courses:
        lessons = Lesson.objects.filter(course=course)
        completed_lessons = UserLessonProgress.objects.filter(user=user, lesson__in=lessons, completed=True).count()
        total_lessons = lessons.count()

        courses_with_progress.append({
            'course': course,
            'completed_lessons': completed_lessons,
            'total_lessons': total_lessons,
            'completed': course.usercourseprogress_set.filter(course=course, user=user).first()
        })

    context = {
        'user_profile': request.user,
        'courses_with_progress': courses_with_progress,
    }

    return render(request, 'index.html', context)


# Courses page
@login_required(login_url='/accounts/login/')
def courses_view(request):
    categories = Category.objects.all()
    context = {
        'categories': categories
    }
    return render(request, 'courses/index.html', context)


# Course detail
# ----------------------------------------------------------------------------------------------------------------------
@login_required(login_url='/accounts/login/')
def course_detail_view(request, pk):
    course = get_object_or_404(Course, pk=pk)
    user = request.user
    first_lesson = course.lessons.first()
    user_course_progress = UserCourseProgress.objects.filter(user=user, course=course).first()
    lessons = Lesson.objects.filter(course=course)
    completed_lessons = UserLessonProgress.objects.filter(user=user, lesson__in=lessons, completed=True).count()
    total_lessons = lessons.count()
    course_progress, created = UserCourseProgress.objects.get_or_create(user=user, course=course)
    all_lessons_completed = (completed_lessons == total_lessons)

    if user_course_progress:
        if user_course_progress.completed:
            action_button = {
                'type': 'complete',
                'label': 'Талдау жасау'
            }
        else:
            action_button = {
                'type': 'continue',
                'label': 'Курсты жалғастыру'
            }
    else:
        action_button = {
            'type': 'start',
            'label': 'Курсты бастау'
        }

    context = {
        'course': course,
        'first_lesson': first_lesson,
        'action_button': action_button,
        'lessons': lessons,
        'completed_lessons': completed_lessons,
        'total_lessons': total_lessons,
        'all_lessons_completed': all_lessons_completed,
        'course_progress': course_progress,
    }
    return render(request, 'courses/course.html', context)


# Start or continue course
@login_required(login_url='/accounts/login/')
def start_or_continue_course(request, pk):
    course = get_object_or_404(Course, pk=pk)
    user = request.user
    user_course_progress, created = UserCourseProgress.objects.get_or_create(user=user, course=course)

    if created:
        user_course_progress.started = True
        user_course_progress.date_started = timezone.now()
        user_course_progress.save()

    return redirect('course_detail', pk=course.pk)


# Lesson detail
# ----------------------------------------------------------------------------------------------------------------------
@login_required(login_url='/accounts/login/')
def lesson_detail_view(request, pk):
    lesson = get_object_or_404(Lesson, pk=pk)
    course = lesson.course
    user = request.user
    lessons = course.lessons.exclude(pk=lesson.pk)
    lesson_progress, created = UserLessonProgress.objects.get_or_create(user=user, lesson=lesson)
    videos = Video.objects.filter(lesson=lesson)
    tests = Test.objects.filter(lesson=lesson)
    tasks = Task.objects.filter(lesson=lesson)

    video_progress = UserVideoProgress.objects.filter(user=user, video__in=videos)
    test_progress = UserTestProgress.objects.filter(user=user, test__in=tests)
    task_progress = UserTaskProgress.objects.filter(user=user, task__in=tasks)

    all_tests_completed = all(tp.completed for tp in test_progress)
    all_tasks_completed = all(tp.completed for tp in task_progress)

    context = {
        'lesson': lesson,
        'lessons': lessons,
        'videos': videos,
        'tests': tests,
        'tasks': tasks,
        'lesson_progress': lesson_progress,
        'video_progress': video_progress,
        'test_progress': test_progress,
        'test_completed': test_progress.first(),
        'task_progress': task_progress,
        'task_completed': task_progress.first(),
        'all_tests_completed': all_tests_completed,
        'all_tasks_completed': all_tasks_completed,
    }

    return render(request, 'courses/lesson.html', context)


# Video watched
@login_required(login_url='/accounts/login/')
def mark_video_watched(request, video_id):
    video = get_object_or_404(Video, pk=video_id)
    user = request.user
    video_progress, created = UserVideoProgress.objects.get_or_create(user=user, video=video)
    if not video_progress.completed:
        video_progress.watched_duration = video.duration
        video_progress.completed = True
        video_progress.save()

    return redirect('lesson_detail', pk=video.lesson.pk)


# Test completed
@login_required(login_url='/accounts/login/')
def submit_test(request, lesson_id):
    lesson = get_object_or_404(Lesson, pk=lesson_id)
    user = request.user
    tests = Test.objects.filter(lesson=lesson)
    score = 0
    total_tests = tests.count()
    for test in tests:
        selected_option_id = request.POST.get(f'question_{test.id}')
        if selected_option_id:
            selected_option = get_object_or_404(TestOption, pk=selected_option_id)
            if selected_option.is_correct:
                score += 1

            UserTestProgress.objects.update_or_create(
                user=user, test=test,
                defaults={'score': score, 'completed': True}
            )
    return redirect('lesson_detail', pk=lesson.id)


# Task completed
@login_required(login_url='/accounts/login/')
def submit_task(request, lesson_id):
    lesson = get_object_or_404(Lesson, pk=lesson_id)
    user = request.user
    tasks = Task.objects.filter(lesson=lesson)

    for task in tasks:
        user_answer = request.POST.get(f'task_answer_{task.id}')
        if user_answer:
            UserTaskProgress.objects.update_or_create(
                user=user, task=task,
                defaults={'answer': user_answer, 'completed': True}
            )
    return redirect('lesson_detail', pk=lesson.id)


# Lesson completed
@login_required(login_url='/accounts/login/')
def complete_lesson(request, pk):
    lesson = get_object_or_404(Lesson, pk=pk)
    user = request.user

    lesson_progress, created = UserLessonProgress.objects.get_or_create(user=user, lesson=lesson)
    lesson_progress.completed = True
    lesson_progress.save()

    return redirect('lesson_detail', pk=lesson.id)


@login_required(login_url='/accounts/login/')
def complete_course(request, pk):
    course = get_object_or_404(Course, pk=pk)
    user = request.user

    course_progress, created = UserCourseProgress.objects.get_or_create(user=user, course=course)
    course_progress.completed = True
    course_progress.save()

    return redirect('course_detail', pk=course.id)