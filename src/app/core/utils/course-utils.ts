export function getCourseStatus(course: any) {
  const loggedInUser = JSON.parse(sessionStorage.getItem("user") || "[]");
    if(course?.bookedStudents?.confirmed?.filter((el: any) => el.email === loggedInUser.email).length > 0)
      return 'Approved';
    if(course?.bookedStudents?.booked?.filter((el: any) => el.email === loggedInUser.email).length > 0)
      return 'Booked';
    else if(course.scheduledDates[0].getTime() > new Date().getTime())
      return 'Upcoming';
    else if (course.scheduledDates[0].getTime() < new Date().getTime() &&  course.scheduledDates[1].getTime() > new Date().getTime())
      return 'In Progress';
    else if (course.scheduledDates[1].getTime() < new Date().getTime())
      return 'Completed';
    return;
  }