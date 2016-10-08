module PhoneNumberHelper
  def phone_icon(phone_type)
    case phone_type
    when 'home'
      content_tag(:span, nil, class: 'glyphicon glyphicon-home')
    when 'work'
      content_tag(:span, nil, class: 'glyphicon glyphicon-briefcase')
    when 'cell'
      content_tag(:span, nil, class: 'glyphicon glyphicon-phone')
    else
      content_tag(:span, nil, class: 'glyphicon glyphicon-earphone')
    end
  end
end
